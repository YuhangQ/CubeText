"use strict";
exports.__esModule = true;
var TabGroup = require("electron-tabs");
var dragula = require("dragula");
var Utils_1 = require("./Utils");
var FileHandler_1 = require("./FileHandler");
var TabManager = /** @class */ (function () {
    function TabManager() {
    }
    TabManager.addTab = function (file) {
        var _this = this;
        // 初始化 tab 以及 webview
        var tab = TabManager.tabGroup.addTab({
            title: Utils_1.Utils.getFileNameByPath(file),
            src: "file://" + __dirname + "/../../views/vscode.html",
            visible: true,
            active: true
        });
        this.filePath[tab.id] = file;
        this.saved[tab.id] = true;
        //tab.setBadge(filePath);
        var webview = tab.webview;
        // 使 editor 页面支持 nodejs
        webview.setAttribute("nodeintegration", null);
        // 开启 editor 的开发者工具
        webview.addEventListener("dom-ready", function () {
            webview.openDevTools();
        });
        webview.addEventListener("ipc-message", function (event) {
            if (event.channel == "editor-loading") {
                var content = void 0;
                if (file != "Untitled")
                    content = FileHandler_1.FileHandler.readText(file);
                else
                    content = "";
                webview.send("set", content);
            }
            if (event.channel == "text-changed") {
                if (_this.isSaved(tab) == false)
                    return;
                var button = document.getElementsByClassName("etabs-tab visible active")[0].getElementsByClassName("etabs-tab-button-close")[0];
                button.innerHTML = "●";
                button.style.fontSize = "16px";
                _this.saved[tab.id] = false;
            }
        });
    };
    TabManager.getCurrentTab = function () {
        return this.tabGroup.getActiveTab();
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
            if (_this.tabGroup.getTabs.length == 0) {
                TabManager.addTab("Untitled");
            }
        });
    };
    TabManager.getFilePath = function (tab) {
        return this.filePath[tab.id];
    };
    TabManager.isSaved = function (tab) {
        return this.saved[tab.id];
    };
    TabManager.filePath = {};
    TabManager.saved = {};
    return TabManager;
}());
exports.TabManager = TabManager;
