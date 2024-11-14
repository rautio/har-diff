/**
 * Message 'type' passed to worker thread.
 */
export enum WorkerMessages {
  FileUpload = "file-upload",
  SortChange = "sort-change",
  ClearAll = "clear-all",
  FilterChange = "filter-change",
}
export interface HAREntry {
  time: number;
  request: {
    url: string;
    method: string;
  };
}

export enum Sort {
  Chronological = "Chronological",
  Alphabetical = "Alphabetical",
}
export enum Order {
  Asc = "Ascending",
  Desc = "Descending",
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

export interface SortChangeMessage {
  sort: Sort;
  order: Order;
}

export interface FilterChangeMessage {
  exclude: string[]; // Maybe these could be accomplished with !() vs ()
  include: string[];
}

export interface Summary {
  duplicates: {
    url: string;
    method: string;
    count: number;
  }[];
}

export interface FileRecord {
  index: number;
  har: HAR;
  name: string;
}
