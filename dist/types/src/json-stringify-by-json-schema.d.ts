interface ISchema {
    type: "string" | "boolean" | "number" | "null" | "object" | "array";
    items?: ISchema;
    properties?: ISchema;
}
export default function jsonStringifyByJsonSchema(obj: unknown, jsonSchema: ISchema, space: number | string): string;
export {};
