(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Dry = factory());
})(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var PendingPromise = /** @class */ (function () {
        function PendingPromise(resolve, reject) {
        }
        PendingPromise.prototype.finally = function (onfinally) {
            throw new Error("Method not implemented.");
        };
        PendingPromise.from = function (fn) {
            return new PendingPromise(function (resolve) {
                resolve(fn());
            });
        };
        PendingPromise.resolve = function (value) {
            return new PendingPromise(function (resolve) {
                resolve(value);
            });
        };
        PendingPromise.reject = function (error) {
            return new PendingPromise(function (resolve, reject) {
                reject(error);
            });
        };
        PendingPromise.prototype.then = function (onFulfilled, onRejected) { };
        PendingPromise.prototype.catch = function (onRejected) { };
        return PendingPromise;
    }());

    var isEqual$1 = {exports: {}};

    var isFn = {exports: {}};

    var objToStr = {exports: {}};

    (function (module, exports) {
    var ObjToStr = Object.prototype.toString;

    exports = function(val) {
        return ObjToStr.call(val);
    };

    module.exports = exports;
    }(objToStr, objToStr.exports));

    (function (module, exports) {
    var objToStr$1 = objToStr.exports;

    exports = function(val) {
        var objStr = objToStr$1(val);
        return (
            objStr === '[object Function]' ||
            objStr === '[object GeneratorFunction]' ||
            objStr === '[object AsyncFunction]'
        );
    };

    module.exports = exports;
    }(isFn, isFn.exports));

    var has = {exports: {}};

    (function (module, exports) {
    var hasOwnProp = Object.prototype.hasOwnProperty;

    exports = function(obj, key) {
        return hasOwnProp.call(obj, key);
    };

    module.exports = exports;
    }(has, has.exports));

    var keys = {exports: {}};

    (function (module, exports) {
    var has$1 = has.exports;

    if (Object.keys && !false) {
        exports = Object.keys;
    } else {
        exports = function(obj) {
            var ret = [];

            for (var key in obj) {
                if (has$1(obj, key)) ret.push(key);
            }

            return ret;
        };
    }

    module.exports = exports;
    }(keys, keys.exports));

    (function (module, exports) {
    var isFn$1 = isFn.exports;
    var has$1 = has.exports;
    var keys$1 = keys.exports;

    exports = function(a, b) {
        return eq(a, b);
    };

    function deepEq(a, b, aStack, bStack) {
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;

        switch (className) {
            case '[object RegExp]':
            case '[object String]':
                return '' + a === '' + b;

            case '[object Number]':
                if (+a !== +a) return +b !== +b;
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;

            case '[object Date]':
            case '[object Boolean]':
                return +a === +b;
        }

        var areArrays = className === '[object Array]';

        if (!areArrays) {
            if (typeof a != 'object' || typeof b != 'object') return false;
            var aCtor = a.constructor;
            var bCtor = b.constructor;
            if (
                aCtor !== bCtor &&
                !(
                    isFn$1(aCtor) &&
                    aCtor instanceof aCtor &&
                    isFn$1(bCtor) &&
                    bCtor instanceof bCtor
                ) &&
                'constructor' in a &&
                'constructor' in b
            )
                return false;
        }

        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;

        while (length--) {
            if (aStack[length] === a) return bStack[length] === b;
        }

        aStack.push(a);
        bStack.push(b);

        if (areArrays) {
            length = a.length;
            if (length !== b.length) return false;

            while (length--) {
                if (!eq(a[length], b[length], aStack, bStack)) return false;
            }
        } else {
            var _keys = keys$1(a);

            var key;
            length = _keys.length;
            if (keys$1(b).length !== length) return false;

            while (length--) {
                key = _keys[length];
                if (!(has$1(b, key) && eq(a[key], b[key], aStack, bStack)))
                    return false;
            }
        }

        aStack.pop();
        bStack.pop();
        return true;
    }

    function eq(a, b, aStack, bStack) {
        if (a === b) return a !== 0 || 1 / a === 1 / b;
        if (a == null || b == null) return a === b;
        if (a !== a) return b !== b;
        var type = typeof a;
        if (type !== 'function' && type !== 'object' && typeof b != 'object')
            return false;
        return deepEq(a, b, aStack, bStack);
    }

    module.exports = exports;
    }(isEqual$1, isEqual$1.exports));

    var isEqual = isEqual$1.exports;

    var _this = undefined;
    var pendingPromiseQueue = [];
    var debouncingPromiseQueue = [];
    var defaultOptions = {
        debouncedMilliseconds: 0,
    };
    var uselessPromise = new PendingPromise();
    var unique = function (sideEffectivePromise, options) {
        if (options === void 0) { options = defaultOptions; }
        var context = _this;
        options = __assign(__assign({}, defaultOptions), options);
        var debouncedMilliseconds = options.debouncedMilliseconds;
        var pickPromise = function (queue, _a) {
            var executor = _a.executor, payload = _a.payload;
            return queue.filter(function (item) {
                if (item.executor === executor && isEqual(item.payload, payload)) {
                    return item;
                }
            })[0];
        };
        var removeQueueElement = function (queue, promise) {
            var spliceIndex = queue.findIndex(function (item) { return item.executor === promise.executor && isEqual(item.payload, promise.payload); });
            if (spliceIndex > -1) {
                queue.splice(spliceIndex, 1);
            }
        };
        var invoke = function () {
            var payload = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                payload[_i] = arguments[_i];
            }
            var hasEvent = payload[0].target && payload[0].currentTarget;
            if (hasEvent) {
                var exclude = ['timeStamp'];
                exclude.forEach(function (keyName) {
                    delete payload[0][keyName];
                });
            }
            var executor = sideEffectivePromise.toString();
            var debounced = debouncedMilliseconds > 0;
            if (debounced) {
                var debouncingPromise_1 = pickPromise(debouncingPromiseQueue, { executor: executor, payload: payload });
                if (debouncingPromise_1.executor) {
                    if (debouncingPromise_1.debouncedTimer) {
                        clearTimeout(debouncingPromise_1.debouncedTimer);
                        debouncingPromise_1.debouncedTimer = setTimeout(function () { return removeQueueElement(debouncingPromiseQueue, debouncingPromise_1); }, debouncedMilliseconds);
                    }
                    return uselessPromise;
                }
            }
            var pendingPromise = pickPromise(pendingPromiseQueue, { executor: executor, payload: payload });
            if (pendingPromise.executor) {
                return uselessPromise;
            }
            else {
                var promise_1 = sideEffectivePromise.apply(context, payload);
                promise_1.executor = executor;
                promise_1.payload = payload;
                if (debounced) {
                    debouncingPromiseQueue.push(promise_1);
                    promise_1.debouncedTimer = setTimeout(function () { return removeQueueElement(debouncingPromiseQueue, promise_1); }, debouncedMilliseconds);
                }
                pendingPromiseQueue.push(promise_1);
                promise_1
                    .then(function () { return removeQueueElement(pendingPromiseQueue, promise_1); })
                    .catch(function () { return removeQueueElement(pendingPromiseQueue, promise_1); });
                return promise_1;
            }
        };
        return invoke;
    };

    return unique;

}));
