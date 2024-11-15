import { clearFiles, getFile, putFile } from "./db";
import {
  HAREntry,
  Diff,
  DiffType,
  HAR,
  FileMessage,
  Summary,
  Sort,
  Order,
  WorkerMessages,
  SortChangeMessage,
  FileRecord,
  StatsBreakdown,
} from "./types";
import { getInitBreakdown, getPath } from "./utils";

const files: Record<number, FileRecord> = {};

/**
 * Determine whether two HAR "entry" records are equal or not.
 * @param entry1
 * @param entry2
 * @returns
 */
const isEntryMatch = (
  entry1: HAREntry,
  entry2: HAREntry,
  threshold: number = 0.75
) => {
  if (getMatchScore(entry1, entry2) >= threshold) return true;
  return false;
};

/**
 * Returns a score of how close two entries are. Max 1.
 * @param entry1
 * @param entry2
 * @returns
 */
const getMatchScore = (entry1: HAREntry, entry2: HAREntry) => {
  const url1 = getPath(entry1.request.url).split("/");
  const url2 = getPath(entry2.request.url).split("/");
  if (url1.length !== url2.length) return 0;
  if (entry1.request.method !== entry2.request.method) return 0;
  let matches = [];
  for (let i = 0; i < url1.length; i++) {
    if (url1[i] === url2[i]) {
      matches.push(url1[i]);
    }
  }
  return matches.length / url1.length;
};

/**
 * Compute the "Longest Common Subsequence" between two HAR "entries" arrays.
 * @param entries1
 * @param entries2
 * @returns
 */
const computeLCS = (entries1: HAREntry[], entries2: HAREntry[]): number[][] => {
  let lcs = Array(entries1.length + 1);
  for (let i = 0; i < entries1.length + 1; i++) {
    lcs[i] = Array(entries2.length + 1);
  }
  for (let i = 0; i < entries1.length + 1; i++) {
    for (let j = 0; j < entries2.length + 1; j++) {
      if (i == 0 || j == 0) {
        lcs[i][j] = 0;
      } else if (isEntryMatch(entries1[i - 1], entries2[j - 1])) {
        lcs[i][j] =
          getMatchScore(entries1[i - 1], entries2[j - 1]) + lcs[i - 1][j - 1];
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }
  }

  return lcs;
};

/**
 * Calculate the differences between two HAR "entries" arrays.
 * @param entries1
 * @param entries2
 * @returns
 */
const computeDiff = (entries1: HAREntry[], entries2: HAREntry[]): Diff[] => {
  const result: Diff[] = [];
  const lcs = computeLCS(entries1, entries2);
  let i = entries1.length;
  let j = entries2.length;
  while (i !== 0 && j !== 0) {
    if (i == 0) {
      result.push({ entry: entries2[i - 1], type: DiffType.Added });
      j -= 1;
    } else if (j === 0) {
      result.push({ entry: entries1[i - 1], type: DiffType.Removed });
      i -= 1;
    } else if (isEntryMatch(entries1[i - 1], entries2[j - 1])) {
      const matchScore = getMatchScore(entries1[i - 1], entries2[j - 1]);
      result.push({
        entry: entries1[i - 1],
        type: matchScore === 1 ? DiffType.Unchanged : DiffType.Partial,
        secondEntry: entries2[j - 1],
      });
      i -= 1;
      j -= 1;
    } else if (lcs[i][j - 1] > lcs[i - 1][j]) {
      result.push({ entry: entries2[j - 1], type: DiffType.Added });
      j -= 1;
    } else {
      result.push({ entry: entries1[i - 1], type: DiffType.Removed });
      i -= 1;
    }
  }

  return result.reverse();
};

const calculateSummary = (har: HAR): Summary => {
  const duplicatesMap: Record<string, number> = {};
  const breakdown: StatsBreakdown = { all: getInitBreakdown() };
  har.log.entries.forEach((entry) => {
    if (entry?._resourceType) {
      let type = entry._resourceType;
      // fetch and xhr are separate types
      if (type === "fetch" || type === "xhr") {
        type = "fetch/XHR";
      }
      if (!(type in breakdown)) {
        breakdown[type] = getInitBreakdown();
      }
      breakdown[type].count += 1;
      breakdown[type].size += entry?.response?.content?.size || 0;
    }
    // All
    breakdown.all.count += 1;
    // Not all HAR files include responses
    if (entry?.response) {
      if (entry?.response?.content?.size) {
        breakdown.all.size += entry.response.content.size;
      }
    }
    const str = `${entry.request.url}🤓${entry.request.method}`;
    duplicatesMap[str] = 1 + (duplicatesMap[str] || 0);
  });
  return {
    duplicates: Object.keys(duplicatesMap)
      .map((k) => {
        const [url, method] = k.split("🤓");
        return {
          url,
          method,
          count: duplicatesMap[k],
        };
      })
      .filter(({ count }) => count > 1)
      .sort((a, b) => b.count - a.count),
    stats: {
      breakdown,
    },
  };
};

const sortEntries = (
  entries: HAREntry[],
  sort: Sort,
  order: Order
): HAREntry[] => {
  // By default the HAR file is stored chronologically
  if (sort === Sort.Chronological) {
    return order === Order.Asc ? [...entries] : [...entries].reverse();
  }
  if (sort === Sort.Alphabetical) {
    return [...entries].sort((a, b) => {
      const aUrl = a.request.url;
      const bUrl = b.request.url;
      if (aUrl < bUrl) {
        return order === Order.Asc ? -1 : 1;
      }
      if (aUrl > bUrl) {
        return order === Order.Asc ? 1 : -1;
      }
      return 0;
    });
  }
  return entries;
};

/**
 * Calculate the diff between two HAR files and post the results back to the main thread.
 * @param har1
 * @param har2
 */
const processDiff = (
  file1: FileRecord,
  file2: FileRecord,
  sort: Sort = Sort.Chronological,
  order: Order = Order.Asc
) => {
  const entries1 = sortEntries(file1.har.log.entries, sort, order);
  const entries2 = sortEntries(file2.har.log.entries, sort, order);
  const diff = computeDiff(entries1, entries2);
  self.postMessage({
    type: "diff",
    data: { diff, leftName: file1.name, rightName: file2.name },
  });
};

const processSummary = (har: HAR, name: string) => {
  const summary = calculateSummary(har);
  self.postMessage({ type: "summary", data: { name, summary } });
};

const processClearAll = () => {
  self.postMessage({
    type: "diff",
    data: { diff: [], leftName: null, rightName: null },
  });
  self.postMessage({
    type: "summary",
    data: { name, summary: { duplicates: [] } },
  });
};

const processSortChange = (sort: Sort, order: Order) => {
  processDiff(files[0], files[1], sort, order);
};

/**
 * Listen for messages from the main thread.
 * @param msg
 */
self.onmessage = (msg: { data: { type: WorkerMessages; data: unknown } }) => {
  switch (msg.data.type) {
    case WorkerMessages.FileUpload:
      const { index, file } = msg.data.data as FileMessage;
      const { name } = file;
      var reader = new FileReader();
      reader.onload = function (event) {
        if (event.target) {
          try {
            const har = JSON.parse(event.target.result);
            files[index] = { har, index, name };
            putFile({ index, har, name });
            if (files[0] && files[1]) {
              processDiff(files[0], files[1]);
            }
            processSummary(har, name);
          } catch (e) {
            console.error(e);
          }
        }
      };
      reader.readAsText(file);
      break;
    case WorkerMessages.ClearAll:
      processClearAll();
      clearFiles();
      break;
    case WorkerMessages.SortChange:
      const { sort, order } = msg.data.data as SortChangeMessage;
      processSortChange(sort, order);
      break;
    default:
      break;
  }
};

/**
 * Utility to re-hydrate the diff using the last HAR files submitted.
 */
const init = async () => {
  const file1 = await getFile(0);
  const file2 = await getFile(1);
  if (file1?.har && file2?.har) {
    files[0] = file1;
    files[1] = file2;
    processDiff(file1, file2);
    processSummary(file1.har, file1.name);
    processSummary(file2.har, file2.name);
  }
};

init();
