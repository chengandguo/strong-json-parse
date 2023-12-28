// var json_stringify = require("./lib/stringify.js").stringify;
import jsonParse from "./json-parse";
import jsonStringifyByType from "./json-stringify-by-type";

export { jsonParse, jsonStringifyByType };

// import jsonStringify =

// module.exports = function (options) {
//   return {
//     parse: json_parse(options),
//     stringify: json_stringify,
//   };
// };
// //create the default method members with no options applied for backwards compatibility
// module.exports.parse = json_parse();
// module.exports.stringify = json_stringify;
