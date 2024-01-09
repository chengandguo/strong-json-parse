import { isString } from "./is";

export default function quote(str) {
  // If the string contains no control characters, no quote characters, and no
  // backslash characters, then we can safely slap some quotes around it.
  // Otherwise we must also replace the offending characters with safe escape
  // sequences.
  const escapable =
    /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
  const meta = {
    // table of character substitutions
    "\b": "\\b",
    "\t": "\\t",
    "\n": "\\n",
    "\f": "\\f",
    "\r": "\\r",
    '"': '\\"',
    "\\": "\\\\",
  };
  escapable.lastIndex = 0;
  if (escapable.test(str)) {
    const newStr = str.replace(escapable, function (a) {
      const c = meta[a];
      return isString(c)
        ? c
        : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
    });
    return `"${newStr}"`;
  }

  return `"${str}"`;
}
