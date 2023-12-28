import { isObject, isUndefined } from "./utils/is";

interface IObj {
  type: "string" | "boolean" | "number" | "null" | "object" | "array";
  value: Array<IObj> | IObj;
}

export default function jsonStringifyByType(obj: IObj, indentLevel = 0) {
  if (!isObject(obj) || isUndefined(obj.type) || isUndefined(obj.value)) {
    throw new Error(
      `obj: ${obj} should be an object with type and originType, value`
    );
  }

  const indentSymbol = " ";
  if (obj.type === "string") {
    if (obj.originType === "number") {
      return obj.value;
    } else {
      return `"${obj.value}"`;
    }
  }

  if (["null", "number", "boolean"].includes(obj.type)) {
    return `${obj.value}`;
  }

  const currentIndentChars = indentSymbol.repeat(indentLevel * 2);
  const nextIndentChars = indentSymbol.repeat((indentLevel + 1) * 2);
  let result = obj.type === "array" ? `[\n` : `{\n`;

  if (obj.type === "array" && Array.isArray(obj.value)) {
    for (const [index, item] of obj.value.entries()) {
      const value = jsonStringifyByType(item, indentLevel + 1);
      result += `${nextIndentChars}${value}`;
      if (index !== obj.value.length - 1) {
        result += ",\n";
      } else {
        result += "\n";
      }
    }
    result += `${currentIndentChars}]`;
  }

  if (obj.type === "object") {
    const keys = Object.keys(obj.value);
    for (const [index, key] of keys.entries()) {
      const value = jsonStringifyByType(obj.value[key], indentLevel + 1);
      result += `${nextIndentChars}"${key}": ${value}`;
      if (index !== keys.length - 1) {
        result += ",\n";
      } else {
        result += "\n";
      }
    }
    result += `${currentIndentChars}}`;
  }

  return result;
}
