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
export interface Diff {
  type: DiffType;
  entry: HAREntry;
  // The longest common subsequence of the URLs if this is a partial match.
  lcs?: string;
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
