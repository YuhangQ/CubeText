import { ipcRenderer } from "electron";
import { FileHandler } from "../models/FileHandler";
import { Utils } from "../models/Utils";
import * as YAML from "yaml";
import * as path from "path";
import * as fs from "fs";

class Config {
    static dataDir: string;
    static scriptsDir: string;
    static cacheDir: string;
    static compile: string;
    static compileRun: string;
    static snippetsDir: string;
    static config: string;
    static snippets: string;

    static conf_json: any;
    static snippets_json: any;
    static init() {
        this.dataDir = path.join(ipcRenderer.sendSync('datapath'), "cubetext");
        this.scriptsDir = path.join(this.dataDir, "scripts");
        this.cacheDir = path.join(this.dataDir, "programsCache");
        this.snippetsDir = path.join(this.dataDir, "snippets");

        this.mkdirIfnotExsit(this.dataDir);
        this.mkdirIfnotExsit(this.scriptsDir);
        this.mkdirIfnotExsit(this.cacheDir);
        this.mkdirIfnotExsit(this.snippetsDir);
        
        this.config = path.join(this.dataDir, "config.json");
        this.snippets = path.join(this.dataDir, "snippets.yml");
        this.compile = path.join(this.scriptsDir, "compile" + (Utils.isWindows() ? ".bat" : ".sh"));
        this.compileRun = path.join(this.scriptsDir, "compile_run"+ (Utils.isWindows() ? ".bat" : ".sh"));

        if(!fs.existsSync(this.compile)) {
            fs.copyFileSync(__dirname + "/../../scripts/compile" + (Utils.isWindows() ? ".bat" : ".sh"), this.compile);
        }
        if(!fs.existsSync(this.compileRun)) {
            fs.copyFileSync(__dirname + "/../../scripts/compile_run" + (Utils.isWindows() ? ".bat" : ".sh"), this.compileRun);
        }
        if(!fs.existsSync(this.config)) {
            fs.copyFileSync(__dirname + "/../../static/configs/config.json", this.config);
        }
        if(fs.existsSync(this.snippets)) {
            fs.copyFileSync(__dirname + "/../../static/configs/snippets.yml", this.snippets);
        }

        Config.reload();
    }
    static hasCompileScript(filetype: string) {
        return fs.existsSync(path.join(this.scriptsDir, `${filetype}_compile` + Utils.isWindows() ? ".bat" : ".sh"));
    }
    static hasRunScript(filetype: string) {
        return fs.existsSync(path.join(this.scriptsDir, `${filetype}_compile_run` + Utils.isWindows() ? ".bat" : ".sh"));
    }

    static reload() {
        let contents = FileHandler.readText(Config.config);
        this.conf_json = JSON.parse(contents.toString("utf8"));
        //this.snippets_json = YAML.parse(FileHandler.readText(Config.snippets));
    }                                                                                                                                     
    static getFontSize(): number {
        return this.conf_json.fontSize;
    }
    static setFontSize(size: number) {
        this.conf_json.fontSize = size;
        this.save();
    }
    static save() {
        FileHandler.saveText(Config.config, JSON.stringify(this.conf_json, null, 4));
    }
    static mkdirIfnotExsit(path: string) {
        if(fs.existsSync(path)) return;
        fs.mkdirSync(path);
    }
    static getSnippetsList(): string[] {
        let arr = fs.readdirSync(Config.snippetsDir);
        for(let i=0; i<arr.length; i++) {
            arr[i] = arr[i].replace(".snippet", "");
        }
        //alert(arr);
        return arr;
    }
}

export { Config };