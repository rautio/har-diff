export interface HAREntry {
  time: number;
  request: {
    url: string;
    method: string;
  };
}

export enum DiffType {
  Unchanged = "Unchanged",
  Added = "Added",
  Removed = "Removed",
  Partial = "Partial",
}

export enum URLDiffType {
  Unchanged = DiffType.Unchanged,
  Changed = "Changed",
}

export interface URLDiff {
  type: URLDiffType;
  first: string;
  second: string;
}
export interface Diff {
  type: DiffType;
  entry: HAREntry;
  // Partial matches require the second entry as well
  secondEntry?: HAREntry;
}

export interface SplitURL {
  url: string;
  protocol: string;
  domain: string;
  path: string;
  queryParams: string;
}

export interface HAR {
  log: {
    entries: HAREntry[];
    version: string;
  };
}

export interface FileMessage {
  index: 0 | 1;
  file: File;
}

export interface Summary {
  duplicates: {
    url: string;
    method: string;
    count: number;
  }[];
}
