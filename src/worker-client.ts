import { Diff, Summary } from "./types";

let worker: Worker | undefined;

type diffCb = (diff: Diff[], leftName: string, rightName: string) => void;
type summaryCb = (stats: { summary: Summary; name: string }) => void;

const diffcallbacks: diffCb[] = [];
const summaryCallbacks: summaryCb[] = [];

export const onDiff = (cb: diffCb) => {
  diffcallbacks.push(cb);
};

export const onSummary = (cb: summaryCb) => {
  summaryCallbacks.push(cb);
};

export const getWorker = (): Worker => {
  if (typeof worker == "undefined") {
    worker = new Worker(new URL("./har-worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (msg) => {
      if (msg && msg?.data) {
        const { type, data } = msg.data;
        switch (type) {
          case "diff":
            diffcallbacks.forEach((cb) => {
              cb(data.diff, data.leftName, data.rightName);
            });
            break;
          case "summary":
            summaryCallbacks.forEach((cb) => {
              cb(data);
            });
            break;
          default:
        }
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
