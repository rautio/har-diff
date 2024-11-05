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

const isEntryMatch = (entry1: HAREntry, entry2: HAREntry) => {
  return (
    isURLMatch(entry1.request.url, entry2.request.url) &&
    entry1.request.method === entry2.request.method
  );
};

// LCS - Longest Common Subsequence
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

self.onmessage = (msg: { data: FileMessage }) => {
  const { index, file } = msg.data;
  var reader = new FileReader();
  reader.onload = function (event) {
    if (event.target) {
      try {
        files[index] = JSON.parse(event.target.result);
        if (files[0] && files[1]) {
          const diff = computeDiff(files[0].log.entries, files[1].log.entries);
          self.postMessage({ type: "diff", data: diff });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
  reader.readAsText(file);
};
