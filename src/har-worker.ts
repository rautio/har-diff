import { getFile, putFile } from "./db";
import { HAREntry, Diff, DiffType, HAR, FileMessage } from "./types";

const files: Record<number, HAR> = {};

const urlRe = new RegExp("(http|https)://(.[^/]*)(.[^?]*)(.*)");
const isURLMatch = (url1: string, url2: string): boolean => {
  // Ignore domain
  const url1Re = urlRe.exec(url1);
  // URL, protocol, domain, path, query params
  const url2Re = urlRe.exec(url2);
  return !!url1Re && !!url2Re && url1Re[3] === url2Re[3];
};

/**
 * Determine whether two HAR "entry" records are equal or not.s
 * @param entry1
 * @param entry2
 * @returns
 */
const isEntryMatch = (entry1: HAREntry, entry2: HAREntry) => {
  return (
    isURLMatch(entry1.request.url, entry2.request.url) &&
    entry1.request.method === entry2.request.method
  );
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
        lcs[i][j] = 1 + lcs[i - 1][j - 1];
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
      result.push({ entry: entries1[i - 1], type: DiffType.Unchanged });
      i -= 1;
      j -= 1;
    } else if (lcs[i][j - 1] <= lcs[i - 1][j]) {
      result.push({ entry: entries2[i - 1], type: DiffType.Added });
      i -= 1;
    } else {
      result.push({ entry: entries1[i - 1], type: DiffType.Removed });
      j -= 1;
    }
  }

  return result.reverse();
};

/**
 * Calculate the diff between two HAR files and post the results back to the main thread.
 * @param har1
 * @param har2
 */
const processDiff = (har1: HAR, har2: HAR) => {
  const diff = computeDiff(har1.log.entries, har2.log.entries);
  self.postMessage({ type: "diff", data: diff });
};

/**
 * Listen for new files being added.
 * @param msg
 */
self.onmessage = (msg: { data: FileMessage }) => {
  const { index, file } = msg.data;
  const { name } = file;
  var reader = new FileReader();
  reader.onload = function (event) {
    if (event.target) {
      try {
        const har = JSON.parse(event.target.result);
        files[index] = har;
        putFile({ index, har, name });
        if (files[0] && files[1]) {
          processDiff(files[0], files[1]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
  reader.readAsText(file);
};

/**
 * Utility to re-hydrate the diff using the last HAR files submitted.
 */
const init = async () => {
  const file1 = await getFile(0);
  const file2 = await getFile(1);
  if (file1?.har && file2?.har) {
    files[0] = file1.har;
    files[1] = file2.har;
    processDiff(file1.har, file2.har);
  }
};

init();
