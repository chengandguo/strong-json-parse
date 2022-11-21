function delay (func, wait) {
    var _this = this;
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    window.setTimeout(function () {
        func.apply(_this, args);
    }, wait);
}

var delay$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: delay
});

function head(arr) {
    return arr.length ? arr[0] : undefined;
}

var head$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: head
});

export { delay$1 as delay, head$1 as head };
//# sourceMappingURL=index.js.map
