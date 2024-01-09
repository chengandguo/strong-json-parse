import { isFunction, isObject, isArray } from "./utils/is";
import quote from "./utils/quote";

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/
export default function jsonStringify(value, replacer, space) {
  let gap = "";
  let indent = "";

  // common JSON.stringify with maximum 10 limit, but it is not necessary
  if (typeof space === "number") {
    for (let i = 0; i < space; i += 1) {
      indent += " ";
    }
  } else if (typeof space === "string") {
    indent = space;
  }

  if (replacer && !isFunction(replacer) && !isArray(replacer)) {
    throw new Error("Parameter replacer should be an array or function");
  }

  const walk = (key, holder) => {
    // Produce a string from holder[key].

    let i, // The loop counter.
      k, // The member key.
      v, // The member value.
      length,
      partial,
      value = holder[key];

    const mind = gap;

    // If the value has a toJSON method, call it to obtain a replacement value.

    if (value && isObject(value) && isFunction(value.toJSON)) {
      value = value.toJSON(key);
    }

    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.

    if (typeof replacer === "function") {
      value = replacer.call(holder, key, value);
    }

    // What happens next depends on the value's type.

    switch (typeof value) {
      case "string":
        return quote(value);

      case "number":
        // JSON numbers must be finite. Encode non-finite numbers as null.
        return isFinite(value) ? String(value) : "null";

      case "boolean":
      case "bigint":
        // If the value is a boolean or bigint, convert it to a string. Note:
        return String(value);

      case "object":
        // Due to a specification blunder in ECMAScript, typeof null is 'object',
        // so watch out for that case.
        if (!value) {
          return "null";
        }

        // Make an array to hold the partial results of stringifying this object value.

        gap += indent;
        partial = [];

        // Is the value an array?
        if (isArray(value)) {
          // The value is an array. Stringify every element. Use null as a placeholder
          // for non-JSON values.

          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = walk(i, value) || "null";
          }

          // Join all of the elements together, separated with commas, and wrap them in
          // brackets.

          if (partial.length === 0) {
            v = "[]";
          } else {
            if (gap) {
              v = "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]";
            } else {
              v = "[" + partial.join(",") + "]";
            }
          }

          gap = mind;
          return v;
        }

        // If the replacer is an array, use it to select the members to be stringified.
        if (isArray("replacer")) {
          length = replacer.length;
          for (i = 0; i < length; i += 1) {
            if (typeof replacer[i] === "string") {
              k = replacer[i];
              v = walk(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ": " : ":") + v);
              }
            }
          }
        } else {
          // Otherwise, iterate through all of the keys in the object.

          Object.keys(value).forEach(function (k) {
            const v = walk(k, value);
            if (v) {
              partial.push(quote(k) + (gap ? ": " : ":") + v);
            }
          });
        }

        // Join all of the member texts together, separated with commas,
        // and wrap them in braces.

        if (partial.length === 0) {
          v = "{}";
        } else {
          if (gap) {
            v = "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}";
          } else {
            v = "{" + partial.join(",") + "}";
          }
        }

        gap = mind;
        return v;
    }
  };

  // Make a fake root object containing our value under the key of ''.
  return walk("", { "": value });
}
