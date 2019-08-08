"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var Utils_1 = require("../models/Utils");
var path = require("path");
var fs = require("fs");
var Config = /** @class */ (function () {
    function Config() {
    }
    Config.init = function () {
        this.dataDir = path.join(electron_1.ipcRenderer.sendSync('datapath'), "cubetext");
        this.scriptsDir = path.join(this.dataDir, "scripts");
        this.cacheDir = path.join(this.dataDir, "programsCache");
        this.mkdirIfnotExsit(this.dataDir);
        this.mkdirIfnotExsit(this.scriptsDir);
        this.mkdirIfnotExsit(this.cacheDir);
        this.compile = path.join(this.scriptsDir, "compile" + (Utils_1.Utils.isWindows() ? ".bat" : ".sh"));
        this.compileRun = path.join(this.scriptsDir, "compile_run" + (Utils_1.Utils.isWindows() ? ".bat" : ".sh"));
        if (!fs.existsSync(this.compile)) {
            fs.copyFileSync(__dirname + "/../../scripts/compile" + (Utils_1.Utils.isWindows() ? ".bat" : ".sh"), this.compile);
        }
        if (!fs.existsSync(this.compileRun)) {
            fs.copyFileSync(__dirname + "/../../scripts/compile_run" + (Utils_1.Utils.isWindows() ? ".bat" : ".sh"), this.compileRun);
        }
    };
    Config.mkdirIfnotExsit = function (path) {
        if (fs.existsSync(path))
            return;
        fs.mkdirSync(path);
    };
    return Config;
}());
exports.Config = Config;
