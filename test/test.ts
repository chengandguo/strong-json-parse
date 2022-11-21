import head from "../src/head";


test("head test", () => {
  expect(head([1, 2, 3])).toBe(1);
  expect(head([])).toBe(undefined);
});
