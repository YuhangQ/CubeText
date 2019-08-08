"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var TabManager_1 = require("./TabManager");
var pty = require("node-pty");
var FileHandler_1 = require("./FileHandler");
var Utils_1 = require("./Utils");
var Config_1 = require("./Config");
var path = require("path");
var Console = /** @class */ (function () {
    function Console() {
    }
    Console.getCurrentFileName = function () {
        return TabManager_1.TabManager.getCurrentTab().getFilePath();
    };
    Console.show = function () {
        if (this.isShow)
            return;
        var tabs = TabManager_1.TabManager.getTabs();
        for (var _i = 0, tabs_1 = tabs; _i < tabs_1.length; _i++) {
            var tab = tabs_1[_i];
            tab.getWebView().send("show");
        }
        this.isShow = true;
    };
    Console.use = function () {
        if (this.isShow) {
            this.hide();
        }
        else {
            this.show();
        }
    };
    Console.hide = function () {
        if (!this.isShow)
            return;
        var tabs = TabManager_1.TabManager.getTabs();
        for (var _i = 0, tabs_2 = tabs; _i < tabs_2.length; _i++) {
            var tab = tabs_2[_i];
            tab.getWebView().send("hide");
        }
        this.isShow = false;
    };
    Console.compile = function (tab) {
        if (tab.runing)
            return;
        tab.runing = true;
        FileHandler_1.FileHandler.autoSaveFunc();
        tab.getWebView().send("clear");
        tab.getWebView().send("waiting", "正在编译...");
        var ptyProcess = pty.spawn(Config_1.Config.compile, [tab.getFilePath(), path.join(Config_1.Config.cacheDir, tab.getID().toString())], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.cwd(),
            env: process.env
        });
        ptyProcess.on("exit", function () {
            tab.runing = false;
        });
        var output = "";
        ptyProcess.on('data', function (data) {
            output += data;
            if (data.indexOf("compile_success") != -1) {
                tab.getWebView().send("success", "编译成功.");
                return;
            }
            if (data.indexOf("compile_error") != -1) {
                tab.getWebView().send("warning", "编译失败.");
                Console.show();
                output = Utils_1.Utils.encode(output).replace("#compile_error" + Utils_1.Utils.linefeed, "").replace("#compile_error", "");
                tab.getWebView().send("output", output);
                return;
            }
        });
    };
    Console.cprun = function (tab, input) {
        var _this = this;
        if (tab.runing)
            return;
        if (tab.isUntitled()) {
            alert("请先保存此文件。");
            return;
        }
        tab.runing = true;
        this.show();
        tab.getWebView().send("clear");
        FileHandler_1.FileHandler.saveText(path.join(Config_1.Config.cacheDir, tab.getID() + ".in"), input);
        tab.getWebView().send("waiting", "正在编译...");
        var args = [tab.getFilePath(), path.join(Config_1.Config.cacheDir, tab.getID().toString()), path.join(Config_1.Config.cacheDir, tab.getID() + ".in")];
        var ptyProcess = pty.spawn(Config_1.Config.compileRun, args, {
            name: "xterm-color",
            cols: 80,
            rows: 30,
            cwd: process.cwd(),
            env: process.env
        });
        var time;
        ptyProcess.on("exit", function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tab.runing = false;
                        tab.getWebView().send("flashOutput");
                        return [4 /*yield*/, Console.sleep(50)];
                    case 1:
                        _a.sent();
                        tab.getWebView().send("ifkill");
                        FileHandler_1.FileHandler.removeFile(path.join(Config_1.Config.cacheDir, tab.getID() + ".exe"));
                        FileHandler_1.FileHandler.removeFile(path.join(Config_1.Config.cacheDir, tab.getID() + ".in"));
                        return [2 /*return*/];
                }
            });
        }); });
        ptyProcess.on('data', function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var now;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            data = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
                            data = Utils_1.Utils.removeShellChar(data);
                            if (data.indexOf("#compile_success") != -1) {
                                time = Date.now();
                                tab.getWebView().send("waiting", "正在运行...");
                                data = data.replace("#compile_success" + Utils_1.Utils.linefeed, "");
                            }
                            if (data.indexOf("#compile_error") != -1) {
                                tab.getWebView().send("warning", "编译失败.");
                                data = data.replace("#compile_error" + Utils_1.Utils.linefeed, "");
                            }
                            if (data.indexOf("#run_error") != -1) {
                                tab.getWebView().send("error", "运行时异常.");
                                data = data.replace(Utils_1.Utils.linefeed + "#run_error", "").replace("#run_error" + Utils_1.Utils.linefeed, "").replace("#run_error", "");
                            }
                            if (!(data.indexOf("#run_success") != -1)) return [3 /*break*/, 3];
                            now = Date.now();
                            if (!((now - time) < 50)) return [3 /*break*/, 2];
                            return [4 /*yield*/, Console.sleep(50)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            tab.getWebView().send("success", "运行成功 " + (now - time) + "ms.");
                            data = data.replace("#run_success\n", "").replace("\n#run_success", "").replace("#run_success", "");
                            _a.label = 3;
                        case 3:
                            tab.getWebView().send("output", data);
                            return [2 /*return*/];
                    }
                });
            });
        });
        return ptyProcess;
    };
    Console.sleep = function (time) {
        if (time === void 0) { time = 0; }
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, time);
        });
    };
    ;
    Console.isShow = false;
    return Console;
}());
exports.Console = Console;
