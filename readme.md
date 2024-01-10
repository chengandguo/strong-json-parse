# document

The readme also has a chinese version.[查看中文](https://github.com/chengandguo/strong-json-parse/blob/main/readme-zh.md)

# description

Based on [json-bigint](https://www.npmjs.com/package/json-bigint), added support for arbitrary precision decimals and `bigInt` numbers

# What problem is strong-json-parse trying to solve?

json-bigint can convert large integers that exceed JS precision to strings, but the type of the number being converted is lost during this conversion. After processing the data, you may still
`stringify` data to a string. Additionally, support for arbitrary-precision decimals has been added.

# Guide

```ts
import { jsonParse } from "strong-json-parse";
const str = `{"id":123456989987654321,"name":"joey","interests":["football","video games"]}`;
// Use storeAsString options to store Bigint numbers as strings
const result = jsonParse(str, { storeAsString: true });
console.log(result);
```

output
The original data type of id was `number`, but now it is stored as `string`

```json
{
  "data": {
    "id": "123456989987654321",
    "name": "joey",
    "interests": ["football", "video games"]
  },
  "dataSchema": {
    "type": "object",
    "originType": "object",
    "value": {
      "id": {
        "type": "string",
        "originType": "number",
        "value": "123456989987654321"
      },
      "name": {
        "type": "string",
        "originType": "string",
        "value": "joey"
      },
      "interests": {
        "type": "array",
        "originType": "array",
        "value": [
          {
            "type": "string",
            "originType": "string",
            "value": "football"
          },
          {
            "type": "string",
            "originType": "string",
            "value": "video games"
          }
        ]
      }
    }
  }
}
```

### Method jsonParse(str: string, options: IOptions)

Convert JSON string to object, return { data, dataSchema } object
Where data represents the original JSON object, and dataSchema contains the pre-conversion and post-conversion data types of each value, please see the following example

#### Parameters

str: JSON string
options:

```ts
interface IOptions {
  strict?: boolean; // not being strict means do not generate syntax errors for "duplicate key", default is false
  storeAsString?: boolean; // toggle whether the values should be stored as BigNumber (default) or a string, default is false
  alwaysParseAsBigInt?: boolean; // toggle whether all numbers should be BigInt Type, default is false
  protoAction?: "error" | "ignore" | "preserve"; // whether keep __proto__ property, default is "error", not allowed
  constructorAction?: "error" | "ignore" | "preserve"; // whether keep constructor property, default is "error", not allowed
}
```

Example: Store all numbers as strings

```
   jsonParse(
     `{ "name": "Joey", "adult": true, "fortune": 123456789987654321987654321, "mixed": ["football", 20, true, 98]}`,
     {
       storeAsString: true, // Convert all numbers to strings
     }
   )
```

output

```ts
{
   //Data after parse
   data: {
     name: "Joey",
     adult: true,
     fortune: "123456789987654321987654321",
     mixed: ["football", "20", true, "98"],
   },

   // After parse, field type
   dataSchema: {
     type: "object",
     originType: "object",
     value: {
       name: {
         type: "string",
         originType: "string",
         value: "Joey",
       },
       adult: {
         type: "boolean",
         originType: "boolean",
         value: true,
       },
       fortune: {
         type: "string", //The current type is string
         originType: "number", // The original type is number
         value: "1234567899987654321987654321",
       },
       mixed: {
         type: "array",
         originType: "array",
         value: [
           {
             type: "string",
             originType: "string",
             value: "football",
           },
           {
             type: "string",
             originType: "number",
             value: "20",
           },
           {
             type: "boolean",
             originType: "boolean",
             value: true,
           },
           {
             type: "string",
             originType: "number",
             value: "98",
           },
         ],
       },
     },
   },
}

```

### Method jsonStringifyByDataSchema(obj: unknown,schema: ISchema, space: number | string)

Function: Serialize the obj object according to the data type provided by dataSchema
**<span style="color: red;">Note: obj and schema are required to have the same structure</span>**
What is the same structure:

- If the object contains an array, the array sub-item type will not be determined after adding or deleting items.
- If it is an object, the data type cannot be determined when adding a new key.
  If your object requires the above operations, please use the `jsonStringifyByJsonSchema` method

#### Parameter Description

obj: object to be serialized
schema: `dataSchema` object generated by `jsonParse`
space: number | string represents formatted indentation

Example

```ts
const data = {
  orderId: "123456789654432", // modified original value
  region: "Germany",
};

const dataSchema = {
  type: "object",
  originType: "object",
  value: {
    orderId: {
      type: "string",
      originType: "number",
      value: "123456789",
    },
    region: {
      type: "string",
      originType: "string",
      value: "China",
    },
  },
};

console.log(jsonStringifyByDataSchema(data, dataSchema, 2));
```

Output JSON string
`orderId` was originally of type `number`, and the original data type is retained at this time

```ts
{
     "orderId": 123456789654432,
     "region": "Germany"
}
```

### Method jsonStringifyByJsonSchema(obj: unknown, jsonSchema: ISchema, space: number | string)

Convert data types according to the common [JSON Schema](https://json-schema.org/) protocol,
If the current field is `string`, determine whether `schema` is `number`, and if it is `number`, convert it, otherwise do not convert it.

#### Why use universal JSON Schema

When adding a field to the data or adding an item to the array, use the common JSON Schema constraint data type.

#### Parameter Description

obj: object to be serialized
schema: Universal JSON schema protocol
space: number | string represents formatted indentation

Example

```ts
const jsonSchema = {
  type: "object",
  properties: {
    id: {
      type: "number",
      title: "id of question",
    },
    title: {
      type: "string",
      title: "title of question",
    },
    choices: {
      type: "array",
      title: "choice list",
      items: {
        type: "string",
        title: "choice item",
      },
    },
  },
};

const data = {
  id: "123", // origin type is number
  title: "The three largest countries by area",
  choices: ["China", "Russia", "America", "Canada", 1],
};

console.log(jsonStringifyByJsonSchema(data, jsonSchema, 2));
```

output
`id` is of `number` type in JSON schema, and the generated string is `number`

```json
{
  "id": 123,
  "title": "The three largest countries by area",
  "choices": ["China", "Russia", "America", "Canada"]
}
```

### Method jsonStringify(value, replacer, space)

Universal JSON.stringify method implementation with consistent usage
