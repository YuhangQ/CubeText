import { TabManager } from "./TabManager";
import { MyTab } from "./MyTab";
import * as pty from "node-pty";
import { FileHandler } from "./FileHandler";
import { app, ipcRenderer } from "electron";
import { Utils } from "./Utils";
import { Config } from "./Config";
import * as path from "path";
class Console {
    private static isShow = false;
    static getCurrentFileName() {
        return TabManager.getCurrentTab().getFilePath();
    }
    static show() {
        if(this.isShow) return;
        let tabs = TabManager.getTabs();
        for(let tab of tabs) {
            tab.getWebView().send("show");
        }
        this.isShow = true;
    }
    static use() {
        if(this.isShow) {
            this.hide();
        } else {
            this.show();
        }
    }
    static hide() {
        if(!this.isShow) return;
        let tabs = TabManager.getTabs();
        for(let tab of tabs) {
            tab.getWebView().send("hide");
        }
        this.isShow = false;
    }
    static compile(tab: MyTab) {
        if(tab.fileType != "cpp") {
            alert("暂不支持非 C++ 程序编译");
            return;
        }
        if(tab.runing) return;
        tab.runing = true;
        FileHandler.autoSaveFunc();
        tab.getWebView().send("clear");
        tab.getWebView().send("waiting", "正在编译...");
        
        const ptyProcess = pty.spawn(Config.compile, [tab.getFilePath(), path.join(Config.cacheDir, tab.getID().toString())], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.cwd(),
            env: process.env
        });
        ptyProcess.on("exit", ()=>{
            tab.runing = false;
        });
        let output = "";
        ptyProcess.on('data', function (data) {
            output += data;
            if(data.indexOf("compile_success") != -1) {
                tab.getWebView().send("success", "编译成功.");
                return;
            }
            if(data.indexOf("compile_error") != -1) {
                tab.getWebView().send("warning", "编译失败.");
                Console.show();
                output = Utils.encode(output).replace("#compile_error" + Utils.linefeed, "").replace("#compile_error", "");
                tab.getWebView().send("output", output);
                return;
            }
        });
    }
    static cprun(tab: MyTab, input: string) {
        if(tab.fileType != "cpp") {
            alert("暂不支持非 C++ 程序编译运行");
            return;
        }
        if(tab.runing) return;
        if(tab.isUntitled()) {
            alert("请先保存此文件。");
            return;
        }
        tab.runing = true;
        FileHandler.autoSaveFunc();

        this.show();
        
        tab.getWebView().send("clear");

        FileHandler.saveText(path.join(Config.cacheDir, tab.getID() + ".in"), input);
        
        tab.getWebView().send("waiting", "正在编译...");
        let args = [tab.getFilePath(), path.join(Config.cacheDir, tab.getID().toString()), path.join(Config.cacheDir, tab.getID() + ".in")];
        const ptyProcess = pty.spawn(Config.compileRun, args, {
            name: "xterm-color",
            cols: 80,
            rows: 30,
            cwd: process.cwd(),
            env: process.env
        });

        let time: number;

        ptyProcess.on("exit", async ()=>{
            tab.runing = false;
            tab.getWebView().send("flashOutput");
            await Console.sleep(50);
            tab.getWebView().send("ifkill");
            FileHandler.removeFile(path.join(Config.cacheDir, tab.getID() + (Utils.isWindows() ? ".exe" : "")));
            FileHandler.removeFile(path.join(Config.cacheDir, tab.getID() + ".in"));
        });
        
        ptyProcess.on('data', async function (data) {
            data = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
            data = Utils.removeShellChar(data);
            if(data.indexOf("#compile_success") != -1) {
                time = Date.now();
                tab.getWebView().send("waiting", "正在运行...");
                data = data.replace("#compile_success"+Utils.linefeed, ""); 
            }
            if(data.indexOf("#compile_error") != -1) {
                tab.getWebView().send("warning", "编译失败.");
                data = data.replace("#compile_error"+Utils.linefeed, "");
            }
            if(data.indexOf("#run_error") != -1) {
                tab.getWebView().send("error", "运行时异常.");
                data = data.replace(Utils.linefeed+"#run_error", "").replace("#run_error"+Utils.linefeed, "").replace("#run_error", "");
            }
            if(data.indexOf("#run_success") != -1) {
                let now = Date.now();
                if((now -  time) < 50) {
                    await Console.sleep(50);
                }
                tab.getWebView().send("success", "运行成功 " + (now -  time) + "ms.");
                data = data.replace("#run_success\n", "").replace("\n#run_success", "").replace("#run_success", "");
            }
            tab.getWebView().send("output", data);
        });
        return ptyProcess;
    }
    static sleep(time = 0) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, time);
        })
    };
}

export { Console };