import extractObjValue from "./utils/extract-obj-value";

/*
/*members "", "\"", "\/", "\\", at, b, call, charAt, f, fromCharCode,
    hasOwnProperty, message, n, name, prototype, push, r, t, text
*/

interface IOptions {
  strict?: boolean; // not being strict means do not generate syntax errors for "duplicate key", default is false
  storeAsString?: boolean; // toggles whether the values should be stored as BigNumber (default) or a string, default is false
  alwaysParseAsBigInt?: boolean; // toggles whether all numbers should be BigInt Type, default is false
  protoAction?: "error" | "ignore" | "preserve"; // whether keep __proto__ property, default is "error", not allowed
  constructorAction?: "error" | "ignore" | "preserve"; // whether keep constructor property, default is "error", not allowed
}

const jsonParse = function (source: string, options?: IOptions) {
  // regexpxs extracted from
  // (c) BSD-3-Clause
  // https://github.com/fastify/secure-json-parse/graphs/contributors and https://github.com/hapijs/bourne/graphs/contributors
  // Here is another issue: hasOwnProperty also will override the object property
  const suspectProtoRx =
    /(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])/;
  const suspectConstructorRx =
    /(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)/;

  // This is a function that can parse a JSON text, producing a JavaScript
  // data structure. It is a simple, recursive descent parser. It does not use
  // eval or regular expressions, so it can be used as a model for implementing
  // a JSON parser in other languages.

  // Default options one can override by passing options to the parse()
  const _options = {
    strict: false, // not being strict means do not generate syntax errors for "duplicate key"
    storeAsString: false, // toggles whether the values should be stored as BigNumber (default) or a string
    alwaysParseAsBigInt: false, // toggles whether all numbers should be BigInt Type
    protoAction: "error",
    constructorAction: "error",
  };

  // If there are options, then use them to override the default _options
  if (options !== undefined && options !== null) {
    if (options.strict === true) {
      _options.strict = true;
    }
    if (options.storeAsString === true) {
      _options.storeAsString = true;
    }
    _options.alwaysParseAsBigInt =
      options.alwaysParseAsBigInt === true
        ? options.alwaysParseAsBigInt
        : false;

    if (typeof options.constructorAction !== "undefined") {
      if (
        options.constructorAction === "error" ||
        options.constructorAction === "ignore" ||
        options.constructorAction === "preserve"
      ) {
        _options.constructorAction = options.constructorAction;
      } else {
        throw new Error(
          `Incorrect value for constructorAction option, must be "error", "ignore" or undefined but passed ${options.constructorAction}`
        );
      }
    }

    if (typeof options.protoAction !== "undefined") {
      if (
        options.protoAction === "error" ||
        options.protoAction === "ignore" ||
        options.protoAction === "preserve"
      ) {
        _options.protoAction = options.protoAction;
      } else {
        throw new Error(
          `Incorrect value for protoAction option, must be "error", "ignore" or undefined but passed ${options.protoAction}`
        );
      }
    }
  }

  let at; // The index of the current character
  let ch; // The current character
  const escapee = {
    '"': '"',
    "\\": "\\",
    "/": "/",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
  };
  let text;

  const error = function (m) {
    // Call error when something is wrong.

    throw {
      name: "SyntaxError",
      message: m,
      at: at,
      text: text,
    };
  };

  const next = function (c?) {
    // If a c parameter is provided, verify that it matches the current character.

    if (c && c !== ch) {
      error("Expected '" + c + "' instead of '" + ch + "'");
    }

    // Get the next character. When there are no more characters,
    // return the empty string.

    ch = text.charAt(at);
    at += 1;
    return ch;
  };

  const number = function () {
    // Parse a number value.

    let number;
    let string = "";

    if (ch === "-") {
      string = "-";
      next("-");
    }
    while (ch >= "0" && ch <= "9") {
      string += ch;
      next();
    }
    if (ch === ".") {
      string += ".";
      while (next() && ch >= "0" && ch <= "9") {
        string += ch;
      }
    }
    if (ch === "e" || ch === "E") {
      string += ch;
      next();
      if (ch === "-" || ch === "+") {
        string += ch;
        next();
      }
      while (ch >= "0" && ch <= "9") {
        string += ch;
        next();
      }
    }
    number = +string;
    if (!isFinite(number)) {
      error("Bad number");
    } else {
      if (_options.storeAsString) {
        return { type: "string", originType: "number", value: string };
      }

      if (Number.isSafeInteger(number))
        if (_options.alwaysParseAsBigInt) {
          return {
            type: "number",
            originType: "number",
            value: BigInt(number),
          };
        } else {
          return { type: "number", originType: "number", value: number };
        }
      // Number with fractional part should be treated as number(double) including big integers in scientific notation, i.e 1.79e+308
      else {
        let result;
        if (/[\.eE]/.test(string)) {
          result = number;
        } else {
          result = BigInt(string);
        }
        return { type: "number", originType: "number", value: result };
      }
    }
  };

  const string = function () {
    // Parse a string value.

    let hex;
    let i;
    let string = "";
    let uffff;

    // When parsing for string values, we must look for " and \ characters.

    if (ch === '"') {
      let startAt = at;
      while (next()) {
        if (ch === '"') {
          if (at - 1 > startAt) string += text.substring(startAt, at - 1);
          next();
          return { type: "string", originType: "string", value: string };
        }
        if (ch === "\\") {
          if (at - 1 > startAt) string += text.substring(startAt, at - 1);
          next();
          if (ch === "u") {
            uffff = 0;
            for (i = 0; i < 4; i += 1) {
              hex = parseInt(next(), 16);
              if (!isFinite(hex)) {
                break;
              }
              uffff = uffff * 16 + hex;
            }
            string += String.fromCharCode(uffff);
          } else if (typeof escapee[ch] === "string") {
            string += escapee[ch];
          } else {
            break;
          }
          startAt = at;
        }
      }
    }
    error("Bad string");
  };

  const white = function () {
    // Skip whitespace and control characters like LF(line feed) '\n' or CR(carriage return) '\r'

    while (ch && ch <= " ") {
      next();
    }
  };

  const word = function () {
    // true, false, or null.

    switch (ch) {
      case "t":
        next("t");
        next("r");
        next("u");
        next("e");
        return { type: "boolean", originType: "boolean", value: true };

      case "f":
        next("f");
        next("a");
        next("l");
        next("s");
        next("e");
        return { type: "boolean", originType: "boolean", value: false };

      case "n":
        next("n");
        next("u");
        next("l");
        next("l");
        return { type: "null", originType: "null", value: null };
    }
    error("Unexpected '" + ch + "'");
  };

  let value; // Place holder for the value function.

  const array = function () {
    // Parse an array value.

    const array = { type: "array", originType: "array", value: [] };

    if (ch === "[") {
      next("[");
      white();
      if (ch === "]") {
        next("]");
        return array; // empty array
      }
      while (ch) {
        array.value.push(value());
        white();
        if (ch === "]") {
          next("]");
          return array;
        }
        next(",");
        white();
      }
    }
    error("Bad array");
  };

  const object = function () {
    // Parse an object value.

    let key;
    const object = { type: "object", originType: "object", value: {} };
    if (ch === "{") {
      next("{");
      white();
      if (ch === "}") {
        next("}");
        return object; // empty object
      }
      while (ch) {
        key = string()?.value;
        white();
        next(":");
        if (
          _options.strict === true &&
          Object.hasOwnProperty.call(object.value, key)
        ) {
          error('Duplicate key "' + key + '"');
        }

        if (suspectProtoRx.test(key) === true) {
          if (_options.protoAction === "error") {
            error("Object contains forbidden prototype property");
          } else if (_options.protoAction === "ignore") {
            value();
          } else {
            object.value[key] = value();
          }
        } else if (suspectConstructorRx.test(key) === true) {
          if (_options.constructorAction === "error") {
            error("Object contains forbidden constructor property");
          } else if (_options.constructorAction === "ignore") {
            value();
          } else {
            object.value[key] = value();
          }
        } else {
          object.value[key] = value();
        }

        white();
        if (ch === "}") {
          next("}");
          return object;
        }
        next(",");
        white();
      }
    }
    error("Bad object");
  };

  value = function () {
    // Parse a JSON value. It could be an object, an array, a string, a number,
    // or a word.
    // debugger;
    white();
    switch (ch) {
      case "{":
        return object();
      case "[":
        return array();
      case '"':
        return string();
      case "-":
        return number();
      default:
        return ch >= "0" && ch <= "9" ? number() : word();
    }
  };

  // Return the jsonParse function. It will have access to all of the above
  // functions and variables.

  text = source + "";
  at = 0;
  ch = " ";
  const dataSchema = value();
  const data = extractObjValue(dataSchema);
  white();
  if (ch) {
    error("Syntax error");
  }

  return { data, dataSchema };
};

export default jsonParse;
