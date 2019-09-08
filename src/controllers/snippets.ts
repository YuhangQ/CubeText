import { ipcRenderer, remote } from "electron";

document.getElementById("new").onclick = ()=> {
    let name = (document.getElementById("name") as HTMLInputElement).value;
    if(name == "") {
        alert("代码段名称不能为空");
        return;
    }
    ipcRenderer.send("newSnippet", name);
}