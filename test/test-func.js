const {
  jsonParse,
  jsonStringifyByType,
  jsonStringify,
  jsonStringifyByDataSchema,
  jsonStringifyByJsonSchema,
} = window.StrongJsonParse;

/* 
  safe integer 
  [-(2**53-1), 2**53-1]  => [-9007199254740991, 9007199254740991]
*/

// const jsonSchema = {
//   type: "object",
//   properties: {
//     id: {
//       type: "number",
//       title: "id of question",
//     },
//     title: {
//       type: "string",
//       title: "title of question",
//     },
//     choices: {
//       type: "array",
//       title: "choice list",
//       items: {
//         type: "string",
//         title: "choice item",
//       },
//     },
//   },
// };

// const data = {
//   id: "123", // origin type is number
//   title: "The three largest countries by area",
//   choices: ["China", "Russia", "America", "Canada"],
// };

// console.log(jsonStringifyByJsonSchema(data, jsonSchema, 2));

const str = `{"id":123456989987654321,"name":"joey","interests":["football","video games"]}`;
const result = jsonParse(str, { storeAsString: true });
console.log(result);
