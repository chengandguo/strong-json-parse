import { DATA_TYPE } from "./constants";
import { isObject, isArray } from "./is";

export default function extractObjValue(obj) {
  if (!isObject(obj)) {
    throw new Error(
      `obj: ${obj} should be an object with type and field properties`
    );
  }

  switch (obj.type) {
    case DATA_TYPE.OBJECT: {
      if (!isObject(obj.value)) {
        throw new Error(
          `obj.type is object, obj.value: ${obj.value} doesn't match`
        );
      }
      const result = {};
      for (const [key, value] of Object.entries(obj.value)) {
        result[key] = extractObjValue(value);
      }
      return result;
    }

    case DATA_TYPE.ARRAY: {
      if (!isArray(obj.value)) {
        throw new Error(
          `obj.type is array, obj.value: ${obj.value} doesn't match`
        );
      }
      const result = [];
      for (const value of obj.value) {
        result.push(extractObjValue(value));
      }
      return result;
    }

    default:
      return obj.value;
  }
}
