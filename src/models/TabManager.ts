import * as TabGroup from "electron-tabs";
import * as dragula from "dragula";
import { MyTab } from "./MyTab";

class TabManager {
    public static tabGroup: TabGroup;
    private static tabs: { [key: number]: MyTab } = {};
    static addTab(file: string) {

        // 如果重复打开，则仅激活已存在的文件
        for (let t of this.getTabs()) {
            if (!t.isUntitled() && t.getFilePath() == file) {
                t.activate();
                return;
            }
        }

        let tab = new MyTab(file);

        // 如果仅有一个未修改的 Untitled，则关闭它
        if (this.getTabs().length == 1 && this.getTabs()[0].isUntitled() && this.getTabs()[0].saved && !tab.isUntitled()) {
            this.getTabs()[0].close(null);
        }

        this.tabs[tab.getID()] = tab;
    }
    static getTabs() {
        let res = new Array<MyTab>();
        for (let key in this.tabs) {
            res.push(this.tabs[key]);
        }
        return res;
    }
    static setFontSize(size: number) {
        let tabs = this.getTabs();
        for (let tab of tabs) {
            tab.getWebView().send("font-size", size);
        }
    }
    static remove(tab: MyTab) {
        //alert("触发删除");
        delete this.tabs[tab.getID()];
    }
    static getCurrentTab() {
        let id = this.tabGroup.getActiveTab().id;
        return this.tabs[id];
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
            if (this.tabGroup.getTabs().length == 0) {
                TabManager.addTab("Untitled");
            }
        });
    }
}

export { TabManager };