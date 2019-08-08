"use strict";
exports.__esModule = true;
var TabManager_1 = require("../models/TabManager");
var electron_1 = require("electron");
var FileHandler_1 = require("../models/FileHandler");
var Console_1 = require("../models/Console");
var Config_1 = require("../models/Config");
var Utils_1 = require("../models/Utils");
TabManager_1.TabManager.init();
Config_1.Config.init();
Utils_1.Utils.init();
TabManager_1.TabManager.addTab("/Users/YuhangQ/Desktop/demo.cpp");
FileHandler_1.FileHandler.autoSave();
electron_1.ipcRenderer.on("action", function (event, arg) {
    switch (arg) {
        case "new":
            FileHandler_1.FileHandler.newFile();
            break;
        case "open":
            FileHandler_1.FileHandler.openFile();
            break;
        case "save":
            FileHandler_1.FileHandler.queryPath(TabManager_1.TabManager.getCurrentTab());
            break;
        case "saveas":
            FileHandler_1.FileHandler.saveAs(TabManager_1.TabManager.getCurrentTab());
            break;
        case "console":
            Console_1.Console.use();
            break;
        case "closetag":
            TabManager_1.TabManager.getCurrentTab().close();
            break;
        case "compile":
            Console_1.Console.compile(TabManager_1.TabManager.getCurrentTab());
            break;
        case "cprun":
            TabManager_1.TabManager.getCurrentTab().getWebView().send("cprun");
            break;
        case "font-larger":
            TabManager_1.TabManager.getCurrentTab().getWebView().send("font-larger");
            break;
        case "font-smaller":
            TabManager_1.TabManager.getCurrentTab().getWebView().send("font-smaller");
            break;
        case "devtools":
            electron_1.ipcRenderer.send("devtools");
            break;
    }
});
