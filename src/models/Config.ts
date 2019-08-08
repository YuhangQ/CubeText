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
    static init() {
        this.dataDir = path.join(ipcRenderer.sendSync('datapath'), "cubetext");
        this.scriptsDir = path.join(this.dataDir, "scripts");
        this.cacheDir = path.join(this.dataDir, "programsCache");

        this.mkdirIfnotExsit(this.dataDir);
        this.mkdirIfnotExsit(this.scriptsDir);
        this.mkdirIfnotExsit(this.cacheDir);
        
        this.compile = path.join(this.scriptsDir, "compile" + (Utils.isWindows() ? ".bat" : ".sh"));
        this.compileRun = path.join(this.scriptsDir, "compile_run"+ (Utils.isWindows() ? ".bat" : ".sh"));

        if(!fs.existsSync(this.compile)) {
            fs.copyFileSync(__dirname + "/../../scripts/compile" + (Utils.isWindows() ? ".bat" : ".sh"), this.compile);
        }
        if(!fs.existsSync(this.compileRun)) {
            fs.copyFileSync(__dirname + "/../../scripts/compile_run" + (Utils.isWindows() ? ".bat" : ".sh"), this.compileRun);
        }
    }
    static mkdirIfnotExsit(path: string) {
        if(fs.existsSync(path)) return;
        fs.mkdirSync(path);
    }
}

export { Config };