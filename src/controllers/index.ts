import { TabManager } from "../models/TabManager";
import { ipcRenderer } from 'electron';
import { FileHandler } from "../models/FileHandler";
import { Console } from "../models/Console";
import { Config } from "../models/Config";
import { Utils } from "../models/Utils";

Config.init();
TabManager.init();
Utils.init();
TabManager.addTab("Untitled");

FileHandler.autoSave();

document.getElementById('drag').ondragstart = (event) => {
    event.preventDefault()
    ipcRenderer.send('ondragstart', '/path/to/item')
}

ipcRenderer.on("action", (event, arg) => {
    switch (arg) {
        case "new": FileHandler.newFile(); break;
        case "open": FileHandler.openFile(); break;
        case "save": FileHandler.queryPath(TabManager.getCurrentTab()); break;
        case "saveas": FileHandler.saveAs(TabManager.getCurrentTab()); break;
        case "console": Console.use(); break;
        case "closetag": TabManager.getCurrentTab().close(); break;
        case "compile": Console.compile(TabManager.getCurrentTab()); break;
        case "cprun": TabManager.getCurrentTab().getWebView().send("cprun"); break;
        case "font-larger": TabManager.getCurrentTab().getWebView().send("font-larger"); Config.setFontSize(Config.getFontSize() + 1); break;
        case "font-smaller": TabManager.getCurrentTab().getWebView().send("font-smaller"); Config.setFontSize(Config.getFontSize() - 1); break;
        case "devtools": ipcRenderer.send("devtools"); break;
        case "settings": TabManager.addTab(Config.config);
    }
});