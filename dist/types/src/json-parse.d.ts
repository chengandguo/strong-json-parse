interface IOptions {
    strict?: boolean;
    storeAsString?: boolean;
    alwaysParseAsBigInt?: boolean;
    protoAction?: "error" | "ignore" | "preserve";
    constructorAction?: "error" | "ignore" | "preserve";
}
declare const jsonParse: (source: string, options?: IOptions) => {
    data: unknown;
    dataSchema: any;
};
export default jsonParse;
