"use strict";
exports.__esModule = true;
var iconv = require("iconv-lite");
var os = require("os");
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.init = function () {
        if (this.isWindows()) {
            this.linefeed = "\r\n";
            this.seperator = "\\";
        }
        else if (this.isMacos()) {
            this.linefeed = "\n";
            this.seperator = "/";
        }
        else {
            this.linefeed = "\n";
            this.seperator = "/";
        }
    };
    Utils.getFileNameByPath = function (path) {
        var pos1 = path.lastIndexOf("/");
        var pos2 = path.lastIndexOf("\\");
        var pos = Math.max(pos1, pos2);
        if (pos < 0)
            return path;
        else
            return path.substring(pos + 1);
    };
    Utils.transtoPath = function (path) {
        return path;
    };
    Utils.removeShellChar = function (s) {
        if (this.isWindows()) {
            var arr = s.match(/\[\w\w|\[\?\w\w\w/g);
            if (arr)
                for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                    var v = arr_1[_i];
                    s = s.replace(v, "");
                }
        }
        else {
            var arr = s.match(/\[0;1;3\dm|\[\dm|\[0;3\dm/g);
            if (arr)
                for (var _a = 0, arr_2 = arr; _a < arr_2.length; _a++) {
                    var v = arr_2[_a];
                    if (v)
                        s = s.replace(v, "");
                }
        }
        return s;
    };
    Utils.encode = function (s) {
        s = this.removeShellChar(s);
        if (this.isWindows()) {
            var buf = iconv.encode(s, "gbk");
            var str = iconv.decode(buf, "utf-8");
            return str;
        }
        else {
            return s;
        }
    };
    Utils.isWindows = function () {
        return os.platform() === "win32";
    };
    Utils.isMacos = function () {
        return os.platform() === "darwin";
    };
    Utils.isLinux = function () {
        return os.platform() === "linux";
    };
    return Utils;
}());
exports.Utils = Utils;
