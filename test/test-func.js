console.log(Lib);

const jsonParse = Lib.jsonParse({ storeAsString: true });
const jsonStringifyByType = Lib.jsonStringifyByType;
/* 
  safe integer 
  [-(2**53-1), 2**53-1]  => [-9007199254740991, 9007199254740991]
*/
const obj = `
  {
    "a": 1,
    "b": 12345678998765432199988777665,
    "c": [1, 2, 3, null, false, true, "abc"],
    "d": 1.123456789987654321458936
  }
`;

const result = jsonParse(obj);
console.log("result: ", result);

const jsonStr = jsonStringifyByType(result);
console.log("jsonStr: ", jsonStr);
