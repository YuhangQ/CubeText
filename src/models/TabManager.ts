import * as TabGroup from "electron-tabs";
import * as dragula from "dragula";
import { Utils } from "./Utils";
import { FileHandler } from "./FileHandler";
import { WebviewTag, dialog, remote } from "electron";
import { Console } from "./Console";
import * as path from "path";

class MyTab {
    private file: string;
    public saved: boolean = true;
    private tab: TabGroup.Tab;
    private webview: WebviewTag;
    public runing: boolean = false;
    public fileType: string;
    public fileTypeName: string;
    private pty;
    constructor(file: string) {

        this.file = file;

        switch(path.extname(this.file)) {
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
            default: this.fileTypeName = "Plain"; this.fileType = "plaintext";
        }

        this.tab = TabManager.tabGroup.addTab({
            title: Utils.getFileNameByPath(this.file),
            src: `file://${__dirname}/../../views/vscode.html`,
            visible: true,
            active: true
        });

        this.tab.on("webview-ready", () => {
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
            if(event.channel == "editor-loading") {
                let content: string;
                if(this.file != "Untitled") content = FileHandler.readText(this.file);
                else content = "";
                this.webview.send("set", content, this.fileType, this.fileTypeName);
            }
            if(event.channel == "cprun") {
                if(!this.runing) this.pty = Console.cprun(this, event.args[0]);
            }
            if(event.channel == "kill") {
                this.pty.kill();
                this.getWebView().send("ifkill");
                this.runing = false;
            }
            if(event.channel == "outlimit") {
                this.pty.kill();
                this.getWebView().send("outlimit");
                this.runing = false;
            }
            if(event.channel == 'text-change') {
                this.saved = false;
            }
        });

    }
    public getID() {
        return this.tab.id;
    }
    public close() {
        if(this.isUntitled()) {
            remote.dialog.showMessageBox(remote.getCurrentWindow(), {
                type: "question",
                message: "文件尚未保存，是否保存",
                detail: "如果选择否文件将不会保存，所做的更改无效。",
                buttons: [
                    "否", "是"
                ],
                defaultId: 0
            }, (id: any) => {
                if(id) {
                    FileHandler.saveAs(this);
                } else {
                    this.tab.close();
                    TabManager.remove(this);
                }
            });
        } else {
            FileHandler.autoSaveFunc();
            this.tab.close();
            TabManager.remove(this);
        }
    }
    public isUntitled() {
        return this.file == "Untitled";
    }
    public setFilePath(file: string) {
        this.file = file;
        this.updateTitle();
    }
    public getFilePath() {
        return this.file;
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

class TabManager {
    public static tabGroup: TabGroup;
    private static tabs:{[key:number] : MyTab} = {};
    static addTab(file: string) {
        let tab = new MyTab(file);
        this.tabs[tab.getID()] = tab;
    }
    static getTabs() {
        let res = new Array<MyTab>();
        for (let key in this.tabs) {
            res.push(this.tabs[key]);
        }
        return res;
    }
    static remove(tab: MyTab) {
        delete this.tabs[tab.getID()];
    }
    static getCurrentTab() {
        let id = this.tabGroup.getActiveTab().id;
        return this.tabs[id];
    }
    static addSetting() {
        TabManager.tabGroup.addTab({
            title: "编辑器设置",
            src: `file://${__dirname}/../../views/setting.html`,
            visible: true,
            active: true
        });
    }
    static init() {
        // 创建 tab 组并加入拖动功能
        this.tabGroup = new TabGroup({
            ready: function (tabGroup) {
                dragula([tabGroup.tabContainer], {
                    direction: "horizontal"
                });
            }
        });
        // 防止所有标签页被关闭
         this.tabGroup.on("tab-removed", (tab, tabGroup) => {
             if(this.tabGroup.getTabs().length == 0) {
                 TabManager.addTab("Untitled");
             }
         });
    }
}

export { TabManager, MyTab };