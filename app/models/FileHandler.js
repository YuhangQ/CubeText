"use strict";
exports.__esModule = true;
var fs = require("fs");
var TabManager_1 = require("./TabManager");
var electron_1 = require("electron");
var FileHandler = /** @class */ (function () {
    function FileHandler() {
    }
    FileHandler.newFile = function () {
        TabManager_1.TabManager.addTab("Untitled");
    };
    FileHandler.saveAs = function (tab) {
        FileHandler.autoSaveFunc();
        var file = electron_1.remote.dialog.showSaveDialog({
            filters: [
                { name: "C/C++ Files", extensions: ['cpp', 'c'] },
                { name: "Text Files", extensions: ['in', 'out', 'ans', 'txt'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        tab.setFilePath(file);
        this.saveFile(tab);
    };
    FileHandler.queryPath = function (tab) {
        if (!tab.isUntitled())
            return;
        var file = electron_1.remote.dialog.showSaveDialog({
            filters: [
                { name: "C/C++ Files", extensions: ['cpp', 'c'] },
                { name: "Text Files", extensions: ['in', 'out', 'ans', 'txt'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        tab.setFilePath(file);
    };
    FileHandler.removeFile = function (path) {
        fs.unlinkSync(path);
    };
    FileHandler.saveFile = function (tab) {
        var _this = this;
        if (tab.isUntitled()) {
            return;
        }
        var webview = tab.getWebView();
        webview.addEventListener("ipc-message", function (event) {
            if (event.channel != "content")
                return;
            _this.saveText(tab.getFilePath(), event.args[0]);
        });
        webview.send("get");
    };
    FileHandler.openFile = function () {
        var files = electron_1.remote.dialog.showOpenDialog(electron_1.remote.getCurrentWindow(), {
            filters: [
                { name: "C/C++ Files", extensions: ['cpp', 'c'] },
                { name: "Text Files", extensions: ['in', 'out', 'ans', 'txt'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            properties: ['openFile']
        });
        if (files) {
            TabManager_1.TabManager.addTab(files[0]);
        }
    };
    FileHandler.autoSaveFunc = function () {
        var tabs = TabManager_1.TabManager.getTabs();
        for (var _i = 0, tabs_1 = tabs; _i < tabs_1.length; _i++) {
            var tab = tabs_1[_i];
            if (!tab.saved) {
                FileHandler.saveFile(tab);
                tab.saved = true;
            }
        }
    };
    FileHandler.autoSave = function () {
        setInterval(this.autoSaveFunc, 2000);
    };
    FileHandler.saveText = function (file, content) {
        fs.writeFileSync(file, content);
    };
    FileHandler.readText = function (file) {
        return fs.readFileSync(file, 'utf8');
    };
    return FileHandler;
}());
exports.FileHandler = FileHandler;
