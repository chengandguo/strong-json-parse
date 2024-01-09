import { isObject, isString, isNumber, isBoolean } from "./utils/is";
import quote from "./utils/quote";

interface ISchema {
  type: "string" | "boolean" | "number" | "null" | "object" | "array";
  items?: ISchema;
  properties?: ISchema;
}

export default function jsonStringifyByJsonSchema(
  obj: unknown,
  jsonSchema: ISchema,
  space: number | string
) {
  let gap = "";
  if (isNumber(space)) {
    gap = " ".repeat(space);
  } else if (isString(space)) {
    gap = space;
  }

  const jsonStringify = (obj, jsonSchema: ISchema, indentLevel = 0) => {
    if (isString(obj)) {
      if (jsonSchema?.type === "number") {
        return `${obj}`;
      } else {
        return quote(obj);
      }
    }

    if (obj === null || isNumber(obj) || isBoolean(obj)) {
      return `${obj}`;
    }

    const currentIndentChars = gap.repeat(indentLevel * 2);
    const nextIndentChars = gap.repeat((indentLevel + 1) * 2);
    if (Array.isArray(obj)) {
      if (!obj.length) {
        return "[]";
      }
      let result = gap ? "[\n" : "[";
      for (const [index, item] of obj.entries()) {
        const value = jsonStringify(item, jsonSchema?.items, indentLevel + 1);
        result += `${nextIndentChars}${value}`;
        if (index !== value.length - 1) {
          result += gap ? ",\n" : ",";
        } else {
          result += gap ? "\n" : "";
        }
      }
      result += `${currentIndentChars}]`;
      return result;
    }

    if (isObject(obj)) {
      const keys = Object.keys(obj);
      if (!keys.length) {
        return "{}";
      }
      let result = gap ? "{\n" : "{";
      for (const [index, key] of keys.entries()) {
        const value = jsonStringify(
          obj[key],
          jsonSchema?.properties?.[key],
          indentLevel + 1
        );
        // if there is gap, give one space between key and value
        const SPACE = gap ? " " : "";
        result += `${nextIndentChars}"${key}":${SPACE}${value}`;
        if (index !== keys.length - 1) {
          result += gap ? ",\n" : ",";
        } else {
          result += gap ? "\n" : "";
        }
      }
      result += `${currentIndentChars}}`;
      return result;
    }
  };

  return jsonStringify(obj, jsonSchema);
}
