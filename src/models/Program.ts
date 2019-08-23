import { MyTab } from "./MyTab";
import { Config } from "./Config";

class Program {
    filepath: string;
    filetype: string;
    constructor(tab: MyTab) {
        this.filepath = tab.getFilePath();
        this.filetype = tab.fileType;
    }
    public hasScript(): boolean {
        return Config.hasCompileScript(this.filetype) && Config.hasRunScript(this.filetype);
    }
    public run() {
        
    }
}