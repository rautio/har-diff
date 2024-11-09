export const urlRegex = new RegExp("(http|https)://(.[^/]*)(.[^?]*)(.*)");
export const uuidRegex = new RegExp(
  "/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i"
);

export const getPath = (url: string): string => {
  // URL, protocol, domain, path, query params
  const match = urlRegex.exec(url);
  if (!match) return "";
  return match[3];
};

export const isUUID = (str: string): boolean => uuidRegex.test(str);

export const isNumeric = (str: string): boolean => {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
};
