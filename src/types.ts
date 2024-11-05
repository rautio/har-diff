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
}
export interface Diff {
  type: DiffType;
  entry: HAREntry;
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
