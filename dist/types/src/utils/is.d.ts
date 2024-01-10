export declare function isArray(obj: unknown): obj is unknown[];
export declare function isObject(obj: unknown): obj is {
    [key: string]: unknown;
};
export declare function isString(obj: unknown): obj is string;
export declare function isNumber(obj: unknown): obj is number;
export declare function isBoolean(obj: unknown): obj is boolean;
export declare function isRegExp(obj: unknown): boolean;
export declare function isFile(obj: unknown): obj is File;
export declare function isBlob(obj: unknown): obj is Blob;
export declare function isUndefined(obj: unknown): obj is undefined;
export declare function isNull(obj: unknown): obj is null;
export declare function isNullOrUndefined(obj: unknown): boolean;
export declare function isFunction(obj: unknown): obj is (...args: unknown[]) => unknown;
