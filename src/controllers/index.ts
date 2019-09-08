import { TabManager } from "../models/TabManager";
import { ipcRenderer, BrowserWindow, ipcMain } from 'electron';
import { FileHandler } from "../models/FileHandler";
import { Console } from "../models/Console";
import { Config } from "../models/Config";
import { Utils } from "../models/Utils";
import * as path from "path";
import { pathToFileURL } from "url";

Config.init();
TabManager.init();
Utils.init();
//TabManager.addTab("Untitled");
TabManager.addTab("/Users/YuhangQ/Desktop/fuck.cpp");

FileHandler.autoSave();

ipcRenderer.on("action", (event, arg) => {
    switch (arg) {
        case "new": FileHandler.newFile(); break;
        case "open": FileHandler.openFile(); break;
        case "save": FileHandler.queryPath(TabManager.getCurrentTab()); break;
        case "saveas": FileHandler.saveAs(TabManager.getCurrentTab()); break;
        case "console": Console.use(); break;
        case "closetag": TabManager.getCurrentTab().close(null); break;
        case "compile": Console.compile(TabManager.getCurrentTab()); break;
        case "cprun": TabManager.getCurrentTab().getWebView().send("cprun"); break;
        case "font-larger": TabManager.getCurrentTab().getWebView().send("font-larger"); Config.setFontSize(Config.getFontSize() + 1); break;
        case "font-smaller": TabManager.getCurrentTab().getWebView().send("font-smaller"); Config.setFontSize(Config.getFontSize() - 1); break;
        case "devtools": ipcRenderer.send("devtools"); break;
        case "settings": TabManager.addTab(Config.config); break;
        case "newSnippets": ipcRenderer.send("snippets"); break;
    }
});

var holder = document.getElementById('drag');
holder.ondragover = function () {
    return false;
};
holder.ondragleave = holder.ondragend = function () {
    return false;
};

holder.ondrop = function (e) {
    e.preventDefault();
    for(let i=0; i<e.dataTransfer.files.length; i++) {
        let file = e.dataTransfer.files[i];
        TabManager.addTab(file.path);
    }
    return false;
};

ipcRenderer.on("drag", (event, file) => {
    TabManager.addTab(file);
});

ipcRenderer.on("newSnippet", (event, name) => {
    let file = path.join(Config.snippetsDir, name + ".snippet");
    Utils.makeFileIfnotExsits(file);
    TabManager.addTab(file);
});

ipcRenderer.on("close-save-all", (event) => {
    let tabs = TabManager.getTabs();
    let cnt = 0;
    for(let tab of tabs) {
        tab.close(()=>{
            cnt++;
            if(cnt == tabs.length) {
                ipcRenderer.send("close-save-all");
            }
        });
    }
});
