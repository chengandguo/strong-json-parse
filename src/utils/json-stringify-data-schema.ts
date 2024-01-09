import { isObject, isUndefined, isString, isNumber } from "./is";
import quote from "./quote";

interface IObj {
  type: "string" | "boolean" | "number" | "null" | "object" | "array";
  value: Array<IObj> | IObj;
}

export default function jsonStringifyDataSchema(
  dataSchema,
  space: number | string
) {
  let gap = "";
  if (isNumber(space)) {
    gap = " ".repeat(space);
  } else if (isString(space)) {
    gap = space;
  }

  const jsonStringify = (obj: IObj, indentLevel = 0) => {
    if (!isObject(obj) || isUndefined(obj.type) || isUndefined(obj.value)) {
      throw new Error(
        `obj: ${obj} should be an object with type and originType, value`
      );
    }

    if (obj.type === "string") {
      if (obj.originType === "number") {
        return obj.value;
      } else {
        return quote(obj.value); // escape characters
      }
    }

    if (["null", "number", "boolean"].includes(obj.type)) {
      return `${obj.value}`;
    }

    const currentIndentChars = gap.repeat(indentLevel * 2);
    const nextIndentChars = gap.repeat((indentLevel + 1) * 2);

    if (obj.type === "array" && Array.isArray(obj.value)) {
      if (!obj.value.length) {
        return "[]";
      }
      let result = gap ? "[\n" : "[";
      for (const [index, item] of obj.value.entries()) {
        const value = jsonStringify(item, indentLevel + 1);
        result += `${nextIndentChars}${value}`;
        if (index !== obj.value.length - 1) {
          result += gap ? ",\n" : ",";
        } else {
          result += gap ? "\n" : "";
        }
      }
      result += `${currentIndentChars}]`;
      return result;
    }

    if (obj.type === "object") {
      const keys = Object.keys(obj.value);
      if (!keys.length) {
        return "{}";
      }
      let result = gap ? "{\n" : "{";
      for (const [index, key] of keys.entries()) {
        const value = jsonStringify(obj.value[key], indentLevel + 1);
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

    throw new Error(`Can't recognize obj.type: ${obj.type}`);
  };

  return jsonStringify(dataSchema);
}
