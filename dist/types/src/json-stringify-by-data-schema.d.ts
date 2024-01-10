interface ISchema {
    type: "string" | "boolean" | "number" | "null" | "object" | "array";
    originType: "string" | "boolean" | "number" | "null" | "object" | "array";
    value: Array<ISchema> | ISchema;
}
export default function jsonStringifyByDataSchema(obj: unknown, schema: ISchema, space: number | string): string;
export {};
