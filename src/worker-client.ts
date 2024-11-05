import { Diff } from "./types";

let worker: Worker | undefined;

type diffCb = (diff: Diff[]) => void;

const diffcallbacks: diffCb[] = [];

export const onDiff = (cb: diffCb) => {
  diffcallbacks.push(cb);
};

export const getWorker = (): Worker => {
  if (typeof worker == "undefined") {
    worker = new Worker(new URL("./har-worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (msg) => {
      const { type, data } = msg?.data;
      switch (type) {
        case "diff":
          diffcallbacks.forEach((cb) => {
            cb(data);
          });
          break;
        default:
      }
    };
  }
  return worker;
};

export const postMessage = (msg: unknown) => {
  if (worker !== undefined) {
    worker.postMessage(msg);
  }
};

if (typeof Worker !== "undefined") {
  getWorker();
}
