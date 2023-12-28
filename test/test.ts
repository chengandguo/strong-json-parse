import jsonParse1 from "../src/json-parse";

const jsonParse = jsonParse1({ storeAsString: true });

test("json parse test", () => {
  expect(jsonParse(`{ "a": 1, "b": 1.123456789987654321}`)).toBe(1);
});
