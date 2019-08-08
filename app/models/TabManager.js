"use strict";
exports.__esModule = true;
var TabGroup = require("electron-tabs");
var dragula = require("dragula");
var Utils_1 = require("./Utils");
var FileHandler_1 = require("./FileHandler");
var electron_1 = require("electron");
var Console_1 = require("./Console");
var MyTab = /** @class */ (function () {
    function MyTab(file) {
        var _this = this;
        this.saved = true;
        this.runing = false;
        this.file = file;
        this.tab = TabManager.tabGroup.addTab({
            title: Utils_1.Utils.getFileNameByPath(this.file),
            src: "file://" + __dirname + "/../../views/vscode.html",
            visible: true,
            active: true
        });
        this.tab.on("webview-ready", function () {
            var button = document.getElementsByClassName("etabs-tab visible active")[0].getElementsByClassName("etabs-tab-button-close")[0];
            var clone = button.cloneNode(true);
            button.parentNode.replaceChild(clone, button);
            clone.addEventListener("click", _this.close.bind(_this));
        });
        this.webview = this.tab.webview;
        // 启用 Nodejs
        this.webview.setAttribute("nodeintegration", null);
        // 开启 editor 的开发者工具
        this.webview.addEventListener("dom-ready", function () {
            //this.webview.openDevTools();
        });
        this.webview.addEventListener("ipc-message", function (event) {
            if (event.channel == "editor-loading") {
                var content = void 0;
                if (_this.file != "Untitled")
                    content = FileHandler_1.FileHandler.readText(_this.file);
                else
                    content = "";
                _this.webview.send("set", content);
            }
            if (event.channel == "cprun") {
                if (!_this.runing)
                    _this.pty = Console_1.Console.cprun(_this, event.args[0]);
            }
            if (event.channel == "kill") {
                _this.pty.kill();
                _this.getWebView().send("ifkill");
                _this.runing = false;
            }
            if (event.channel == "outlimit") {
                _this.pty.kill();
                _this.getWebView().send("outlimit");
                _this.runing = false;
            }
            if (event.channel == 'text-change') {
                _this.saved = false;
            }
        });
    }
    MyTab.prototype.getID = function () {
        return this.tab.id;
    };
    MyTab.prototype.close = function () {
        var _this = this;
        if (this.isUntitled()) {
            electron_1.remote.dialog.showMessageBox(electron_1.remote.getCurrentWindow(), {
                type: "question",
                message: "文件尚未保存，是否保存",
                detail: "如果选择否文件将不会保存，所做的更改无效。",
                buttons: [
                    "否", "是"
                ],
                defaultId: 0
            }, function (id) {
                if (id) {
                    FileHandler_1.FileHandler.saveAs(_this);
                }
                else {
                    _this.tab.close();
                    TabManager.remove(_this);
                }
            });
        }
        else {
            FileHandler_1.FileHandler.autoSaveFunc();
            this.tab.close();
            TabManager.remove(this);
        }
    };
    MyTab.prototype.isUntitled = function () {
        return this.file == "Untitled";
    };
    MyTab.prototype.setFilePath = function (file) {
        this.file = file;
        this.updateTitle();
    };
    MyTab.prototype.getFilePath = function () {
        return this.file;
    };
    MyTab.prototype.updateTitle = function () {
        this.tab.setTitle(Utils_1.Utils.getFileNameByPath(this.file));
    };
    MyTab.prototype.setTitle = function (title) {
        this.tab.setTitle(title);
    };
    MyTab.prototype.getWebView = function () {
        return this.webview;
    };
    return MyTab;
}());
exports.MyTab = MyTab;
var TabManager = /** @class */ (function () {
    function TabManager() {
    }
    TabManager.addTab = function (file) {
        var tab = new MyTab(file);
        this.tabs[tab.getID()] = tab;
    };
    TabManager.getTabs = function () {
        var res = new Array();
        for (var key in this.tabs) {
            res.push(this.tabs[key]);
        }
        return res;
    };
    TabManager.remove = function (tab) {
        delete this.tabs[tab.getID()];
    };
    TabManager.getCurrentTab = function () {
        var id = this.tabGroup.getActiveTab().id;
        return this.tabs[id];
    };
    TabManager.addSetting = function () {
        TabManager.tabGroup.addTab({
            title: "编辑器设置",
            src: "file://" + __dirname + "/../../views/setting.html",
            visible: true,
            active: true
        });
    };
    TabManager.init = function () {
        var _this = this;
        // 创建 tab 组并加入拖动功能
        this.tabGroup = new TabGroup({
            ready: function (tabGroup) {
                dragula([tabGroup.tabContainer], {
                    direction: "horizontal"
                });
            }
        });
        // 防止所有标签页被关闭
        this.tabGroup.on("tab-removed", function (tab, tabGroup) {
            if (_this.tabGroup.getTabs().length == 0) {
                TabManager.addTab("Untitled");
            }
        });
    };
    TabManager.tabs = {};
    return TabManager;
}());
exports.TabManager = TabManager;
