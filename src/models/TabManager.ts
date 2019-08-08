import * as TabGroup from "electron-tabs";
import * as dragula from "dragula";
import { Utils } from "./Utils";
import { FileHandler } from "./FileHandler";
import { WebviewTag, dialog, remote } from "electron";
import { Console } from "./Console";
import { V4MAPPED } from "dns";

class MyTab {
    private file: string;
    public saved: boolean = true;
    private tab: TabGroup.Tab;
    private webview: WebviewTag;
    public runing: boolean = false;
    private pty;
    constructor(file: string) {
        this.file = file;
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
                this.webview.send("set", content);
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