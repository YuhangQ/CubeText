import * as fs from "fs";
import { TabManager } from "./TabManager";
import { remote } from "electron";
import { Utils } from "./Utils";
import { MyTab } from "./TabManager";
import { Config } from "./Config";

class FileHandler {
    static newFile() {
        TabManager.addTab("Untitled");
    }

    static saveAs(tab: MyTab) {
        FileHandler.autoSaveFunc();
        const file = remote.dialog.showSaveDialog( {
            filters: [
                { name: "C/C++ Files", extensions: ['cpp', 'c'] },
                { name: "Text Files", extensions: ['in', 'out', 'ans', 'txt'] },
                { name: 'All Files', extensions: ['*'] }],
        });
        tab.setFilePath(file);
        this.saveFile(tab);
    }

    static queryPath(tab: MyTab) {
        if(!tab.isUntitled()) return;
        const file = remote.dialog.showSaveDialog( {
            filters: [
                { name: 'All Files', extensions: ['*'] }],
        });
        tab.setFilePath(file);
    }

    static removeFile(path: string) {
        fs.unlinkSync(path);
    }

    static saveFile(tab: MyTab) {
        if(tab.isUntitled()) return;
        let webview = tab.getWebView();
        webview.addEventListener("ipc-message", (event)=>{
            if(event.channel != "content") return;
            this.saveText(tab.getFilePath(), event.args[0]);
        });
        webview.send("get");
    }

    static openFile() {
        const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
            filters: [
                { name: 'All Files', extensions: ['*'] }],
            properties: ['openFile']
        });
        if(files) {
            TabManager.addTab(files[0]);
        }
    }

    static autoSaveFunc() {
        let tabs = TabManager.getTabs();
        for(let tab of tabs) {
            if(!tab.saved) {
                FileHandler.saveFile(tab);
                tab.saved = true;
            }
        }
    }

    static autoSave() {
        setInterval(this.autoSaveFunc, 2000);
    }

    static saveText(file: string, content: string) {
        fs.writeFileSync(file, content);
    }
 
    static readText(file: string): string {
        return fs.readFileSync(file, 'utf8');
    }

}

export { FileHandler };