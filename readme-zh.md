# strong json parse

基于[json-bigint](https://www.npmjs.com/package/json-bigint)，增加了任意精度小数与`bigInt`数字的支持

# strong-json-parse 要解决什么问题?

json-bigint 可以将超过 JS 精度的大整数转换为字符串，但在此转换过程中会丢失被转换数字的类型。在将数据进行处理后，你仍可能
将数据 `stringify` 为字符串。另外增加了对任意精度小数的支持。

# 使用方法

```ts
import { jsonParse } from "strong-json-parse";
const str = `{"id":123456989987654321,"name":"joey","interests":["football","video games"]}`;
// 使用storeAsString将Bigint数字存储为字符串
const result = jsonParse(str, { storeAsString: true });
console.log(result);
```

output

```json
{
  "data": {
    "id": "123456989987654321", // id被存储为字符串
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

# 方法 jsonParse(str: string, options: IOptions)

将 JSON 字符串转换为对象，返回{ data, dataSchema } 对象
其中 data 表示原始的 JSON 对象，而 dataSchema 则包含了每个 value 的转换前和转换后的数据类型，请查看下面示例

## 参数

str: JSON 字符串
options：

```ts
interface IOptions {
  strict?: boolean; // not being strict means do not generate syntax errors for "duplicate key", default is false
  storeAsString?: boolean; // toggles whether the values should be stored as BigNumber (default) or a string, default is false
  alwaysParseAsBigInt?: boolean; // toggles whether all numbers should be BigInt Type, default is false
  protoAction?: "error" | "ignore" | "preserve"; // whether keep __proto__ property, default is "error", not allowed
  constructorAction?: "error" | "ignore" | "preserve"; // whether keep constructor property, default is "error", not allowed
}
```

示例：将所有数字存储为字符串

```
  jsonParse(
    `{ "name": "Joey", "adult": true, "fortune": 123456789987654321987654321, "mixed": ["football", 20, true, 98]}`,
    {
      storeAsString: true,  // 将所有数字转换为字符串
    }
  )
```

输出

```ts
{
  // parse后的数据
  data: {
    name: "Joey",
    adult: true,
    fortune: "123456789987654321987654321",
    mixed: ["football", "20", true, "98"],
  },

  // parse后，字段类型
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
        type: "string", // 当前类型为string
        originType: "number", // 原始类型是number
        value: "123456789987654321987654321",
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

# 方法 jsonStringifyByDataSchema(obj: unknown,schema: ISchema, space: number | string)

功能：依据 dataSchema 提供的数据类型将 obj 对象序列化
**<span style="color: red;">注意：这里要求 obj 与 schema 具有相同的结构</span>**
什么是相同的结构：

- 如果对象包含数组，在新增和删除项后，将会无法判定数组子项类型
- 如果是对象，新增 key 会无法判定数据类型
  如果你的对象需要上述操作，请使用`jsonStringifyByJsonSchema`方法

## 参数说明

obj：待序列化的对象
schema: `jsonParse` 生成的 `dataSchema` 对象
space：number | string 表示格式化的缩进

示例

```ts
const data = {
  orderId: "123456789654432", // 修改了原始值
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

输出 JSON 字符串
`orderId` 原来为 `number` 类型，此时保留了原始的数据类型

```ts
{
    "orderId": 123456789654432,
    "region": "Germany"
}
```

# 方法 jsonStringifyByJsonSchema(obj: unknown, jsonSchema: ISchema, space: number | string)

根据通用的 [JSON Schema](https://json-schema.org/) 协议转换数据类型，
如果当前字段为`string`，则判断`schema`是否为`number`，如果为`number`则转换，否则不转换。

## 为什么使用通用的 JSON Schema

在对数据增加字段或者数组增加一项时，使用通用的 JSON Schema 约束数据类型

## 参数说明

obj：待序列化的对象
schema: 通用 JSON schema 协议
space：number | string 表示格式化的缩进

示例

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

输出
`id` 在 JSON schema 中`number`类型，生成的字符串即为`number`

```json
{
  "id": 123,
  "title": "The three largest countries by area",
  "choices": ["China", "Russia", "America", "Canada"]
}
```

# 方法 jsonStringify(value, replacer, space)

通用的 JSON.stringify 方法实现，用法一致
