import { MyTab } from "./MyTab";
import { Config } from "./Config";

class Program {
    filepath: string;
    filetype: string;

    constructor(tab: MyTab) {
        this.filepath = tab.getFilePath();
        this.filetype = tab.fileType;
    }
    public run() {
        
    }
    public hasCompileScript(): boolean {
        return Config.hasCompileScript(this.filetype);
    }
    public hasScript() {
        return Config.hasRunScript(this.filetype);
    }
}