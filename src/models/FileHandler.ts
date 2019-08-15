import * as fs from "fs";
import { TabManager } from "./TabManager";
import { remote } from "electron";
import { Utils } from "./Utils";
import { MyTab } from "./MyTab";
import { Config } from "./Config";
import * as iconv from "iconv-lite";
import { stringify } from "querystring";

class FileHandler {
    static newFile() {
        TabManager.addTab("Untitled");
    }

    static saveAs(tab: MyTab) {
        FileHandler.autoSaveFunc();
        const file = remote.dialog.showSaveDialog({
            filters: [
                { name: "C/C++ Files", extensions: ['cpp', 'c'] },
                { name: "Text Files", extensions: ['in', 'out', 'ans', 'txt'] },
                { name: 'All Files', extensions: ['*'] }],
        });
        tab.setFilePath(file);
        this.saveFile(tab);
    }

    static queryPath(tab: MyTab) {
        if (!tab.isUntitled()) return;
        const file = remote.dialog.showSaveDialog({
            filters: [
                { name: 'All Files', extensions: ['*'] }],
        });
        tab.setFilePath(file);
    }

    static removeFile(path: string) {
        fs.unlinkSync(path);
    }

    static saveFile(tab: MyTab, func: Function = null) {
        if (tab.isUntitled()) {
            if (func) func();
            return;
        }
        let webview = tab.getWebView();
        webview.addEventListener("ipc-message", (event) => {
            if (event.channel != "content") return;
            this.saveText(tab.getFilePath(), tab.encoding == "GBK" ? this.getGBKContent(event.args[0]): event.args[0]);
            tab.saved = true;
            if (func) func();
        });
        webview.send("get");
        if (func) func();
    }

    static openFile() {
        const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
            filters: [
                { name: 'All Files', extensions: ['*'] }],
            properties: ['openFile']
        });
        if (files) {
            TabManager.addTab(files[0]);
        }
    }

    static autoSaveFunc(func: Function = null) {
        let tabs = TabManager.getTabs();
        for (let tab of tabs) {
            if (!tab.saved) {
                FileHandler.saveFile(tab, func);
            }
        }
    }

    static autoSave() {
        setInterval(this.autoSaveFunc, 2000);
    }

    static saveText(file: string, content: string) {
        //alert(content);
        fs.writeFileSync(file, content);
    }

    static readText(file: string): Buffer {
        return fs.readFileSync(file);
    }

    static getEncoding(buffer: Buffer): string {
        let text = this.getTextFromBuffer(buffer, "UTF-8");
        if(text.search("�") != -1) return "GBK";
        return "UTF-8";
    }

    static getTextFromBuffer(buffer: Buffer, encoding: string): string {
        //alert(encoding + ":" + iconv.decode(buffer, encoding));
        return iconv.decode(buffer, encoding);
    }

    static getGBKContent(text: string): string {
        return text;
    }

}

export { FileHandler };