export function isArray(obj: unknown): obj is unknown[] {
  return Object.prototype.toString.call(obj) === "[object Array]";
}

export function isObject(obj: unknown): obj is { [key: string]: unknown } {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

export function isString(obj: unknown): obj is string {
  return Object.prototype.toString.call(obj) === "[object String]";
}

export function isNumber(obj: unknown): obj is number {
  return (
    Object.prototype.toString.call(obj) === "[object Number]" && obj === obj
  );
}

export function isBoolean(obj: unknown): obj is boolean {
  return Object.prototype.toString.call(obj) === "[object Boolean]";
}

export function isRegExp(obj: unknown) {
  return Object.prototype.toString.call(obj) === "[object RegExp]";
}

export function isFile(obj: unknown): obj is File {
  return Object.prototype.toString.call(obj) === "[object File]";
}

export function isBlob(obj: unknown): obj is Blob {
  return Object.prototype.toString.call(obj) === "[object Blob]";
}

export function isUndefined(obj: unknown): obj is undefined {
  return obj === undefined;
}

export function isNull(obj: unknown): obj is null {
  return obj === null;
}

export function isNullOrUndefined(obj: unknown): boolean {
  return obj === null || obj === undefined;
}

export function isFunction(
  obj: unknown
): obj is (...args: unknown[]) => unknown {
  return typeof obj === "function";
}
