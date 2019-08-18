import * as TabGroup from "electron-tabs";
import { Utils } from "./Utils";
import { FileHandler } from "./FileHandler";
import { WebviewTag, dialog, remote } from "electron";
import { Console } from "./Console";
import * as path from "path";
import { Config } from "./Config";
import { TabManager } from "./TabManager";

class MyTab {
    private file: string;
    public saved: boolean = true;
    private tab: TabGroup.Tab;
    private webview: WebviewTag;
    public runing: boolean = false;
    public fileType: string;
    public fileTypeName: string;
    public encoding: string = "UTF-8";
    private pty;
    constructor(file: string) {

        this.file = file;

        this.updateFileType();

        this.tab = TabManager.tabGroup.addTab({
            title: Utils.getFileNameByPath(this.file),
            src: `file://${__dirname}/../../views/vscode.html`,
            visible: true,
            active: true
        });

        this.tab.on("active", () => {
            let button = document.getElementsByClassName("etabs-tab visible active")[0].getElementsByClassName("etabs-tab-button-close")[0] as HTMLElement;
            let clone = button.cloneNode(true);
            button.parentNode.replaceChild(clone, button);
            clone.addEventListener("click", this.close.bind(this));
        });

        this.webview = this.tab.webview;

        // 启用 Nodejs
        this.webview.setAttribute("nodeintegration", null);
        // 开启 editor 的开发者工具
        this.webview.addEventListener("dom-ready", () => {
            //this.webview.openDevTools();
        });
        this.webview.addEventListener("ipc-message", (event) => {
            if (event.channel == "editor-loading") {
                let content: string = "";
                if (this.file != "Untitled") {
                    let buffer = FileHandler.readText(this.file);
                    this.encoding = FileHandler.getEncoding(buffer);
                    content = FileHandler.getTextFromBuffer(buffer, this.encoding);
                }
                this.webview.send("encoding", this.encoding);
                this.webview.send("set", content, this.fileType, this.fileTypeName, Config.getFontSize());
            }
            if (event.channel == "cprun") {
                if (!this.runing) this.pty = Console.cprun(this, event.args[0]);
            }
            if (event.channel == "kill") {
                this.pty.kill();
                this.getWebView().send("ifkill");
                this.runing = false;
            }
            if (event.channel == "outlimit") {
                this.pty.kill();
                this.getWebView().send("outlimit");
                this.runing = false;
            }
            if (event.channel == 'text-change') {
                this.saved = false;
            }
        });
        this.activate();
    }
    public getID() {
        return this.tab.id;
    }
    public close(func: Function) {
        if (this.isUntitled() && !this.saved) {
            let promise = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
                type: "question",
                message: "是否要保存对未命名文件的更改?",
                detail: "选择不保存，已经存在的更改将不复存在。",
                buttons: ["不保存", "返回", "保存"],
                defaultId: 2
            });
            // 不保存
            if (promise == 0) {
                TabManager.remove(this);
                this.tab.close();
                try{if (func) func();}catch(e){}
            }
            // 保存
            if (promise == 2) {
                FileHandler.saveAs(this);
            }
            // 默认返回
            return;
        }
        TabManager.remove(this);
        FileHandler.saveFile(this, () => {
            if (this.getFilePath() == Config.config) {
                Config.reload();
            }
            this.tab.close();
            //console.log(func);
            if (func) func();
        });
    }
    public isUntitled() {
        return this.file == "Untitled";
    }
    public setFilePath(file: string) {
        this.file = file;
        this.updateTitle();
        this.updateFileType();
        this.webview.send("fileType", this.fileType, this.fileTypeName);
    }
    public updateFileType() {
        switch (path.extname(this.file)) {
            // C
            case ".c": this.fileTypeName = "C"; this.fileType = "c"; break;
            case ".h": this.fileTypeName = "C++"; this.fileType = "cpp"; break;
            // C++
            case ".cpp": this.fileTypeName = "C++"; this.fileType = "cpp"; break;
            case ".cc": this.fileTypeName = "C++"; this.fileType = "cpp"; break;
            // bat
            case ".cmd": this.fileTypeName = "Batch"; this.fileType = "bat"; break;
            case ".bat": this.fileTypeName = "Batch"; this.fileType = "bat"; break;
            // web
            case ".css": this.fileTypeName = "CSS"; this.fileType = "css"; break;
            case ".html": this.fileTypeName = "HTML"; this.fileType = "html"; break;
            case ".js": this.fileTypeName = "JavaScript"; this.fileType = "javascript"; break;
            // Golang
            case ".go": this.fileTypeName = "Go"; this.fileType = "go"; break;
            // Python
            case ".py": this.fileTypeName = "Python"; this.fileType = "python"; break;
            case ".json": this.fileTypeName = "JSON"; this.fileType = "json"; break;
            case ".java": this.fileTypeName = "Java"; this.fileType = "java"; break;
            case ".markdown": this.fileTypeName = "Markdown"; this.fileType = "markdown"; break;
            case ".php": this.fileTypeName = "PHP"; this.fileType = "php"; break;
            case ".ts": this.fileTypeName = "TypeScript"; this.fileType = "typescript"; break;
            case ".sh": this.fileTypeName = "Shell"; this.fileType = "shell"; break;
            case ".yml": this.fileTypeName = "YAML"; this.fileType = "yaml"; break;
            case ".yaml": this.fileTypeName = "YAML"; this.fileType = "yaml"; break;
            case ".xml": this.fileTypeName = "XML"; this.fileType = "xml"; break;
            default: this.fileTypeName = "Text"; this.fileType = "plaintext";
        }
    }
    public getFilePath() {
        return this.file;
    }
    public activate() {
        this.tab.activate();
    }
    public updateTitle() {
        this.tab.setTitle(Utils.getFileNameByPath(this.file));
    }
    public setTitle(title: string) {
        this.tab.setTitle(title);
    }
    public getWebView() {
        return this.webview;
    }
}

export { MyTab };