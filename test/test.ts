import jsonParse from "../src/json-parse";

test("json parse test", () => {
  expect(jsonParse("9007199254741234", { storeAsString: true })).toStrictEqual({
    data: "9007199254741234",
    dataSchema: {
      type: "string",
      originType: "number",
      value: "9007199254741234",
    },
  });

  expect(
    jsonParse(
      `{"a": 1.123456789987654321, "b": [1,2], "c": true, "d": { "d1": true, "d2": "abc"}, "e": 123456789987654321}`,
      { storeAsString: true }
    )
  ).toStrictEqual({
    data: {
      a: "1.123456789987654321",
      b: ["1", "2"],
      c: true,
      d: {
        d1: true,
        d2: "abc",
      },
      e: "123456789987654321",
    },
    dataSchema: {
      type: "object",
      originType: "object",
      value: {
        a: {
          type: "string",
          originType: "number",
          value: "1.123456789987654321",
        },
        b: {
          type: "array",
          originType: "array",
          value: [
            {
              type: "string",
              originType: "number",
              value: "1",
            },
            {
              type: "string",
              originType: "number",
              value: "2",
            },
          ],
        },
        c: {
          type: "boolean",
          originType: "boolean",
          value: true,
        },
        d: {
          type: "object",
          originType: "object",
          value: {
            d1: {
              type: "boolean",
              originType: "boolean",
              value: true,
            },
            d2: {
              type: "string",
              originType: "string",
              value: "abc",
            },
          },
        },
        e: {
          type: "string",
          originType: "number",
          value: "123456789987654321",
        },
      },
    },
  });
});
