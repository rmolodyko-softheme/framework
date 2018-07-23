define("lib/module", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Module = /** @class */ (function () {
        function Module() {
            console.log('hello');
        }
        return Module;
    }());
    exports.Bootstrap = Module;
});
define("main", ["require", "exports", "lib/module"], function (require, exports, module_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    new module_1.Module();
    console.log('hello');
});
//# sourceMappingURL=app.js.map