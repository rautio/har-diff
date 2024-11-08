export const urlRe = new RegExp("(http|https)://(.[^/]*)(.[^?]*)(.*)");

export const getPath = (url: string): string => {
  // URL, protocol, domain, path, query params
  const match = urlRe.exec(url);
  if (!match) return "";
  return match[3];
};
