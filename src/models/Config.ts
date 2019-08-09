import { ipcRenderer } from "electron";
import { FileHandler } from "../models/FileHandler";
import { Utils } from "../models/Utils";
import * as path from "path";
import * as fs from "fs";
import { ENGINE_METHOD_STORE } from "constants";
import { TabManager } from "./TabManager";

class Config {
    static dataDir: string;
    static scriptsDir: string;
    static cacheDir: string;
    static compile: string;
    static compileRun: string;
    static config: string;
    static conf: string;
    static init() {
        this.dataDir = path.join(ipcRenderer.sendSync('datapath'), "cubetext");
        this.scriptsDir = path.join(this.dataDir, "scripts");
        this.cacheDir = path.join(this.dataDir, "programsCache");

        this.mkdirIfnotExsit(this.dataDir);
        this.mkdirIfnotExsit(this.scriptsDir);
        this.mkdirIfnotExsit(this.cacheDir);
        
        this.config = path.join(this.dataDir, "config.json");
        this.compile = path.join(this.scriptsDir, "compile" + (Utils.isWindows() ? ".bat" : ".sh"));
        this.compileRun = path.join(this.scriptsDir, "compile_run"+ (Utils.isWindows() ? ".bat" : ".sh"));

        if(!fs.existsSync(this.compile)) {
            fs.copyFileSync(__dirname + "/../../scripts/compile" + (Utils.isWindows() ? ".bat" : ".sh"), this.compile);
        }
        if(!fs.existsSync(this.compileRun)) {
            fs.copyFileSync(__dirname + "/../../scripts/compile_run" + (Utils.isWindows() ? ".bat" : ".sh"), this.compileRun);
        }
        if(!fs.existsSync(this.config)) {
            fs.copyFileSync(__dirname + "/../../scripts/config.json", this.config);
        }

        Config.reload();
    }
    static reload() {
        this.conf = JSON.parse(FileHandler.readText(this.config));
        console.log(this.conf);
        TabManager.setFontSize(this.getFontSize());
    }
    static getFontSize(): number {
        return this.conf["font-size"];
    }
    static setFontSize(size: number) {
        this.conf["font-size"] = size;
        console.log(size);
        this.save();
    }
    static save() {
        FileHandler.saveText(Config.config, this.conf.toString());
    }
    static mkdirIfnotExsit(path: string) {
        if(fs.existsSync(path)) return;
        fs.mkdirSync(path);
    }
}

export { Config };