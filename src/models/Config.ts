import { ipcRenderer } from "electron";
import { FileHandler } from "../models/FileHandler";
import { Utils } from "../models/Utils";
import * as path from "path";
import * as fs from "fs";

class Config {
    static dataDir: string;
    static scriptsDir: string;
    static cacheDir: string;
    static compile: string;
    static compileRun: string;
    static config: string;
    static conf: any;
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
            fs.copyFileSync(__dirname + "/../../static/config.json", this.config);
        }

        Config.reload();
    }
    static reload() {
        let contents = FileHandler.readText(Config.config);
        this.conf = JSON.parse(contents.toString("utf8"));
    }
    static getFontSize(): number {
        return this.conf.fontSize;
    }
    static setFontSize(size: number) {
        this.conf.fontSize = size;
        this.save();
    }
    static save() {
        FileHandler.saveText(Config.config, JSON.stringify(this.conf, null, 4));
    }
    static mkdirIfnotExsit(path: string) {
        if(fs.existsSync(path)) return;
        fs.mkdirSync(path);
    }
}

export { Config };