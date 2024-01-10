interface IObj {
    type: "string" | "boolean" | "number" | "null" | "object" | "array";
    value: Array<IObj> | IObj;
}
export default function jsonStringifyDataSchema(dataSchema: any, space: number | string): string | IObj | IObj[];
export {};
