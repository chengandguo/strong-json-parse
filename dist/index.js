const DATA_TYPE = {
    STRING: "string",
    NUMBER: "number",
    BOOLEAN: "boolean",
    NULL: "null",
    OBJECT: "object",
    ARRAY: "array",
};

function isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
}
function isObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
}
function isString(obj) {
    return Object.prototype.toString.call(obj) === "[object String]";
}
function isNumber(obj) {
    return (Object.prototype.toString.call(obj) === "[object Number]" && obj === obj);
}
function isBoolean(obj) {
    return Object.prototype.toString.call(obj) === "[object Boolean]";
}
function isFunction(obj) {
    return typeof obj === "function";
}

function extractObjValue(obj) {
    if (!isObject(obj)) {
        throw new Error(`obj: ${obj} should be an object with type and field properties`);
    }
    switch (obj.type) {
        case DATA_TYPE.OBJECT: {
            if (!isObject(obj.value)) {
                throw new Error(`obj.type is object, obj.value: ${obj.value} doesn't match`);
            }
            const result = {};
            for (const [key, value] of Object.entries(obj.value)) {
                result[key] = extractObjValue(value);
            }
            return result;
        }
        case DATA_TYPE.ARRAY: {
            if (!isArray(obj.value)) {
                throw new Error(`obj.type is array, obj.value: ${obj.value} doesn't match`);
            }
            const result = [];
            for (const value of obj.value) {
                result.push(extractObjValue(value));
            }
            return result;
        }
        default:
            return obj.value;
    }
}

const jsonParse = function (source, options) {
    // regexpxs extracted from
    // (c) BSD-3-Clause
    // https://github.com/fastify/secure-json-parse/graphs/contributors and https://github.com/hapijs/bourne/graphs/contributors
    // Here is another issue: hasOwnProperty also will override the object property
    const suspectProtoRx = /(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])/;
    const suspectConstructorRx = /(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)/;
    // This is a function that can parse a JSON text, producing a JavaScript
    // data structure. It is a simple, recursive descent parser. It does not use
    // eval or regular expressions, so it can be used as a model for implementing
    // a JSON parser in other languages.
    // Default options one can override by passing options to the parse()
    const _options = {
        strict: false,
        storeAsString: false,
        alwaysParseAsBigInt: false,
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
            if (options.constructorAction === "error" ||
                options.constructorAction === "ignore" ||
                options.constructorAction === "preserve") {
                _options.constructorAction = options.constructorAction;
            }
            else {
                throw new Error(`Incorrect value for constructorAction option, must be "error", "ignore" or undefined but passed ${options.constructorAction}`);
            }
        }
        if (typeof options.protoAction !== "undefined") {
            if (options.protoAction === "error" ||
                options.protoAction === "ignore" ||
                options.protoAction === "preserve") {
                _options.protoAction = options.protoAction;
            }
            else {
                throw new Error(`Incorrect value for protoAction option, must be "error", "ignore" or undefined but passed ${options.protoAction}`);
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
    const next = function (c) {
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
        }
        else {
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
                }
                else {
                    return { type: "number", originType: "number", value: number };
                }
            // Number with fractional part should be treated as number(double) including big integers in scientific notation, i.e 1.79e+308
            else {
                let result;
                if (/[\.eE]/.test(string)) {
                    result = number;
                }
                else {
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
                    if (at - 1 > startAt)
                        string += text.substring(startAt, at - 1);
                    next();
                    return { type: "string", originType: "string", value: string };
                }
                if (ch === "\\") {
                    if (at - 1 > startAt)
                        string += text.substring(startAt, at - 1);
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
                    }
                    else if (typeof escapee[ch] === "string") {
                        string += escapee[ch];
                    }
                    else {
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
                if (_options.strict === true &&
                    Object.hasOwnProperty.call(object.value, key)) {
                    error('Duplicate key "' + key + '"');
                }
                if (suspectProtoRx.test(key) === true) {
                    if (_options.protoAction === "error") {
                        error("Object contains forbidden prototype property");
                    }
                    else if (_options.protoAction === "ignore") {
                        value();
                    }
                    else {
                        object.value[key] = value();
                    }
                }
                else if (suspectConstructorRx.test(key) === true) {
                    if (_options.constructorAction === "error") {
                        error("Object contains forbidden constructor property");
                    }
                    else if (_options.constructorAction === "ignore") {
                        value();
                    }
                    else {
                        object.value[key] = value();
                    }
                }
                else {
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

function quote(str) {
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    const escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    const meta = {
        // table of character substitutions
        "\b": "\\b",
        "\t": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        '"': '\\"',
        "\\": "\\\\",
    };
    escapable.lastIndex = 0;
    if (escapable.test(str)) {
        const newStr = str.replace(escapable, function (a) {
            const c = meta[a];
            return isString(c)
                ? c
                : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        });
        return `"${newStr}"`;
    }
    return `"${str}"`;
}

/*jslint evil: true, regexp: true */
/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/
function jsonStringify(value, replacer, space) {
    let gap = "";
    let indent = "";
    // common JSON.stringify with maximum 10 limit, but it is not necessary
    if (typeof space === "number") {
        for (let i = 0; i < space; i += 1) {
            indent += " ";
        }
    }
    else if (typeof space === "string") {
        indent = space;
    }
    if (replacer && !isFunction(replacer) && !isArray(replacer)) {
        throw new Error("Parameter replacer should be an array or function");
    }
    const walk = (key, holder) => {
        // Produce a string from holder[key].
        let i, // The loop counter.
        k, // The member key.
        v, // The member value.
        length, partial, value = holder[key];
        const mind = gap;
        // If the value has a toJSON method, call it to obtain a replacement value.
        if (value && isObject(value) && isFunction(value.toJSON)) {
            value = value.toJSON(key);
        }
        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.
        if (typeof replacer === "function") {
            value = replacer.call(holder, key, value);
        }
        // What happens next depends on the value's type.
        switch (typeof value) {
            case "string":
                return quote(value);
            case "number":
                // JSON numbers must be finite. Encode non-finite numbers as null.
                return isFinite(value) ? String(value) : "null";
            case "boolean":
            case "bigint":
                // If the value is a boolean or bigint, convert it to a string. Note:
                return String(value);
            case "object":
                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.
                if (!value) {
                    return "null";
                }
                // Make an array to hold the partial results of stringifying this object value.
                gap += indent;
                partial = [];
                // Is the value an array?
                if (isArray(value)) {
                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = walk(i, value) || "null";
                    }
                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.
                    if (partial.length === 0) {
                        v = "[]";
                    }
                    else {
                        if (gap) {
                            v = "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]";
                        }
                        else {
                            v = "[" + partial.join(",") + "]";
                        }
                    }
                    gap = mind;
                    return v;
                }
                // If the replacer is an array, use it to select the members to be stringified.
                if (isArray("replacer")) {
                    length = replacer.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof replacer[i] === "string") {
                            k = replacer[i];
                            v = walk(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v);
                            }
                        }
                    }
                }
                else {
                    // Otherwise, iterate through all of the keys in the object.
                    Object.keys(value).forEach(function (k) {
                        const v = walk(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v);
                        }
                    });
                }
                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.
                if (partial.length === 0) {
                    v = "{}";
                }
                else {
                    if (gap) {
                        v = "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}";
                    }
                    else {
                        v = "{" + partial.join(",") + "}";
                    }
                }
                gap = mind;
                return v;
        }
    };
    // Make a fake root object containing our value under the key of ''.
    return walk("", { "": value });
}

// data schema if is array
function jsonStringifyByDataSchema(obj, schema, space) {
    let gap = "";
    if (isNumber(space)) {
        gap = " ".repeat(space);
    }
    else if (isString(space)) {
        gap = space;
    }
    const jsonStringify = (obj, schema, indentLevel = 0) => {
        if (isString(obj)) {
            if (schema?.originType === "number") {
                return `${obj}`;
            }
            else {
                return quote(obj);
            }
        }
        if (obj === null || isNumber(obj) || isBoolean(obj)) {
            return `${obj}`;
        }
        const currentIndentChars = gap.repeat(indentLevel * 2);
        const nextIndentChars = gap.repeat((indentLevel + 1) * 2);
        if (Array.isArray(obj)) {
            if (!obj.length) {
                return "[]";
            }
            let result = gap ? "[\n" : "[";
            for (const [index, item] of obj.entries()) {
                const value = jsonStringify(item, schema?.value?.[index], indentLevel + 1);
                result += `${nextIndentChars}${value}`;
                if (index !== value.length - 1) {
                    result += gap ? ",\n" : ",";
                }
                else {
                    result += gap ? "\n" : "";
                }
            }
            result += `${currentIndentChars}]`;
            return result;
        }
        if (isObject(obj)) {
            const keys = Object.keys(obj);
            if (!keys.length) {
                return "{}";
            }
            let result = gap ? "{\n" : "{";
            for (const [index, key] of keys.entries()) {
                const value = jsonStringify(obj[key], schema?.value?.[key], indentLevel + 1);
                // if there is gap, give one space between key and value
                const SPACE = gap ? " " : "";
                result += `${nextIndentChars}"${key}":${SPACE}${value}`;
                if (index !== keys.length - 1) {
                    result += gap ? ",\n" : ",";
                }
                else {
                    result += gap ? "\n" : "";
                }
            }
            result += `${currentIndentChars}}`;
            return result;
        }
    };
    return jsonStringify(obj, schema);
}

function jsonStringifyByJsonSchema(obj, jsonSchema, space) {
    let gap = "";
    if (isNumber(space)) {
        gap = " ".repeat(space);
    }
    else if (isString(space)) {
        gap = space;
    }
    const jsonStringify = (obj, jsonSchema, indentLevel = 0) => {
        if (isString(obj)) {
            if (jsonSchema?.type === "number") {
                return `${obj}`;
            }
            else {
                return quote(obj);
            }
        }
        if (obj === null || isNumber(obj) || isBoolean(obj)) {
            return `${obj}`;
        }
        const currentIndentChars = gap.repeat(indentLevel * 2);
        const nextIndentChars = gap.repeat((indentLevel + 1) * 2);
        if (Array.isArray(obj)) {
            if (!obj.length) {
                return "[]";
            }
            let result = gap ? "[\n" : "[";
            for (const [index, item] of obj.entries()) {
                const value = jsonStringify(item, jsonSchema?.items, indentLevel + 1);
                result += `${nextIndentChars}${value}`;
                if (index !== value.length - 1) {
                    result += gap ? ",\n" : ",";
                }
                else {
                    result += gap ? "\n" : "";
                }
            }
            result += `${currentIndentChars}]`;
            return result;
        }
        if (isObject(obj)) {
            const keys = Object.keys(obj);
            if (!keys.length) {
                return "{}";
            }
            let result = gap ? "{\n" : "{";
            for (const [index, key] of keys.entries()) {
                const value = jsonStringify(obj[key], jsonSchema?.properties?.[key], indentLevel + 1);
                // if there is gap, give one space between key and value
                const SPACE = gap ? " " : "";
                result += `${nextIndentChars}"${key}":${SPACE}${value}`;
                if (index !== keys.length - 1) {
                    result += gap ? ",\n" : ",";
                }
                else {
                    result += gap ? "\n" : "";
                }
            }
            result += `${currentIndentChars}}`;
            return result;
        }
    };
    return jsonStringify(obj, jsonSchema);
}

export { jsonParse, jsonStringify, jsonStringifyByDataSchema, jsonStringifyByJsonSchema };
