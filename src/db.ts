import { openDB, DBSchema, IDBPDatabase } from "idb";
import { HAR, FileRecord } from "./types";

const DB_NAME = "har-db";
const DB_VERSION = 1;
const FILES = "files";

interface HARDB extends DBSchema {
  files: {
    key: number;
    value: {
      index: number;
      har: HAR;
      name: string;
    };
  };
}

let db_instance: IDBPDatabase<HARDB> | undefined;

/**
 * Initialize the IndexedDB db.
 * @returns
 */
const getDB = async () => {
  if (typeof db_instance === "undefined") {
    db_instance = await openDB<HARDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(FILES, { keyPath: "index" });
      },
    });
  }
  return db_instance;
};

getDB();

/**
 * Store or update the HAR file saved in indexedb.
 * @param param0
 */
export const putFile = async ({ index, har, name }: FileRecord) => {
  const db = await getDB();
  if (db) {
    await db.put(FILES, { index, har, name });
  }
};

/**
 * Retrieve the HAR file and metadata stored in indexedb.
 * @param index
 * @returns
 */
export const getFile = async (
  index: number
): Promise<FileRecord | undefined> => {
  const db = await getDB();
  if (db) {
    return await db.get(FILES, index);
  }
  return;
};

/**
 * Delete both files from the db.
 */
export const clearFiles = async () => {
  const db = await getDB();
  if (db) {
    await db.delete(FILES, 0);
    await db.delete(FILES, 1);
    return;
  }
  return;
};
