import {
  URLDiff,
  URLDiffType,
  SplitURL,
  StatsBreakdown,
  StatsBreakdownRecord,
} from "./types";

export const urlRegex = new RegExp("(http|https)://(.[^/]*)(.[^?]*)(.*)");
export const uuidRegex = new RegExp(
  "/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i"
);

export const getPath = (url: string): string => {
  return splitURL(url)?.path || "";
};

export const splitURL = (url: string): SplitURL | undefined => {
  // URL, protocol, domain, path, query params
  const match = urlRegex.exec(url);
  if (!match) return undefined;
  return {
    url: match[0],
    protocol: match[1],
    domain: match[2],
    path: match[3],
    queryParams: match[4],
  };
};

export const isUUID = (str: string): boolean => uuidRegex.test(str);

export const isNumeric = (str: string): boolean => {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
};

/**
 * Url1 and Url2 have to have the same number of '/'
 * @param url1
 * @param url2
 * @returns
 */
export const getURLDiff = (url1: string, url2: string = ""): URLDiff[] => {
  const result: URLDiff[] = [];
  const path1 = getPath(url1);
  const path2 = getPath(url2);
  // We ignore domain and protocol
  result.push({
    type: URLDiffType.Unchanged,
    first: `${splitURL(url1)?.protocol}://${splitURL(url1)?.domain}`,
    second: `${splitURL(url2)?.protocol}://${splitURL(url2)?.domain}`,
  });
  const split1 = path1.split("/");
  const split2 = path2.split("/");
  if (split1.length !== split2.length) {
    throw new Error("getURLDiff(): Both URLs must have the same number of '/'");
  }
  // Path starts with '/' so first items is empty
  for (let i = 1; i < split1.length; i++) {
    let type = URLDiffType.Changed;
    if (split1[i] === split2[i]) {
      type = URLDiffType.Unchanged;
    }
    result.push({ type, first: split1[i], second: split2[i] });
  }
  return result;
};

export const getInitBreakdown = (): StatsBreakdownRecord => {
  const initBreakdown = {
    count: 0,
    totalDownload: 0,
    avgDownload: 0,
    avgTime: 0,
  };
  return { ...initBreakdown };
};
