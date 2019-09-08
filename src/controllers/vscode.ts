/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
import { remote, ipcRenderer, ipcMain } from "electron";
import { Console } from "../models/Console";
import { Config } from "../models/Config";
import { TabManager } from "../models/TabManager";
import { FileHandler } from "../models/FileHandler";
import * as path from "path";

declare var amdRequire;
var editor: monaco.editor.IStandaloneCodeEditor;
var input: monaco.editor.IStandaloneCodeEditor;
var output: monaco.editor.IStandaloneCodeEditor;

Config.init();

amdRequire(['vs/editor/editor.main'], () => {
    ipcRenderer.sendToHost("editor-loading");
});

/**
 * 初始化文本
 */
ipcRenderer.on("set", (event, content, lang, langName, fontSize) => {
    editor = monaco.editor.create(document.getElementById('container'), {
        value: content,
        language: lang,
        automaticLayout: true,
        theme: "vs-dark",
    });
    document.getElementById("lang").innerHTML = "&nbsp;" + langName + "&nbsp;";
    editor.onDidChangeCursorPosition((e)=>{
        document.getElementById("line-info").innerHTML = "&nbsp;" + "行 " + e.position.lineNumber + ", 列 " + e.position.column + "&nbsp;";
    });
    editor.onDidChangeModelContent(()=>{
        ipcRenderer.sendToHost("text-change");
    });

    editor.onKeyUp((e)=>{
        if(e.code != "Tab") return;
        let pos = editor.getPosition();
        let line = editor.getModel().getValueInRange(new monaco.Range(pos.lineNumber, 1, pos.lineNumber, pos.column));
        let spaceNum = 0;
        for(let i=line.length-1; i>=0; i--) {
            if(line[i] == " ") spaceNum++;
            else break;
        }
        line = line.slice(0, line.length-spaceNum);
        
        let names = Config.getSnippetsList();
        for(let name of names) {
            if(!line.endsWith(name)) continue;
            var range = new monaco.Range(pos.lineNumber, pos.column-spaceNum-name.length, pos.lineNumber, pos.column);
            var id = { major: 1, minor: 1 };
            var text = FileHandler.readText(path.join(Config.snippetsDir, name + ".snippet")).toString("utf-8");
            var op = {identifier: id, range: range, text: text, forceMoveMarkers: true};
            editor.executeEdits("my-source", [op]);
            break;
        }
    });

    input = monaco.editor.create(document.getElementById('input'), {
        automaticLayout: true,
        theme: "vs-dark",
        minimap: {enabled: false},
        lineNumbersMinChars: 3,
        lineDecorationsWidth: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        disableLayerHinting: true,
        selectionHighlight: false,
    });
    output = monaco.editor.create(document.getElementById('output'), {
        automaticLayout: true,
        theme: "vs-dark",
        minimap: {enabled: false},
        lineNumbersMinChars: 3,
        lineDecorationsWidth: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        disableLayerHinting: true,
        selectionHighlight: false,
        readOnly: true
    });
    editor.updateOptions({fontSize: fontSize});
    input.updateOptions({fontSize: fontSize});
    output.updateOptions({fontSize: fontSize});
});


document.getElementById("lang").onmouseenter = () => {
    document.getElementById("lang").style.backgroundColor = "#177ec4"
};
document.getElementById("lang").onmouseleave = () => {
    document.getElementById("lang").style.backgroundColor = "#0063a6"
};

document.getElementById("line-info").onmouseenter = () => {
    document.getElementById("line-info").style.backgroundColor = "#177ec4"
};
document.getElementById("line-info").onmouseleave = () => {
    document.getElementById("line-info").style.backgroundColor = "#0063a6"
};

document.getElementById("encoding").onmouseenter = () => {
    document.getElementById("encoding").style.backgroundColor = "#177ec4"
};
document.getElementById("encoding").onmouseleave = () => {
    document.getElementById("encoding").style.backgroundColor = "#0063a6"
};

document.getElementById("kill").onmouseenter = () => {
    document.getElementById("kill").style.backgroundColor = "#177ec4"
};
document.getElementById("kill").onmouseleave = () => {
    document.getElementById("kill").style.backgroundColor = "#0063a6"
};

document.getElementById("kill").onmouseup = () => {
    ipcRenderer.sendToHost("kill");
};


ipcRenderer.on("get", (event)=>{
    ipcRenderer.sendToHost("content", editor.getValue());
});

let buf = "";
ipcRenderer.on("output", (event, txt)=>{
    buf += txt;
});
function foutput() {
    if(buf.length > 50000) {
        ipcRenderer.sendToHost("outlimit");
    }
    if(buf != "") {
        output.setValue(output.getValue() + buf);
        output.revealLine(1000000000000);
        buf = "";
    }
}
setInterval(foutput, 1000);
ipcRenderer.on("flashOutput", (event)=>{
    foutput();
});

ipcRenderer.on("cprun", (event)=>{
    ipcRenderer.sendToHost("cprun", input.getValue());
});
ipcRenderer.on("clear", (event)=>{
    output.setValue("");
});
ipcRenderer.on("hide", (event)=>{
    document.getElementById("input").hidden = true;
    document.getElementById("output").hidden = true;
    document.getElementById("liney").hidden = true;
    document.getElementById("container").style.height = "calc(100vh - 20px)";
});
ipcRenderer.on("show", (event)=>{
    document.getElementById("input").hidden = false;
    document.getElementById("output").hidden = false;
    document.getElementById("liney").hidden = false;
    document.getElementById("container").style.height = "50vh";
});
ipcRenderer.on("font-larger", (event)=>{
    let size = editor.getConfiguration().fontInfo.fontSize + 1;
    editor.updateOptions({fontSize: size});
    input.updateOptions({fontSize: size});
    output.updateOptions({fontSize: size});
});
ipcRenderer.on("font-smaller", (event)=>{
    let size = editor.getConfiguration().fontInfo.fontSize - 1;
    editor.updateOptions({fontSize: size});
    input.updateOptions({fontSize: size});
    output.updateOptions({fontSize: size});
});
let icon = document.getElementById("svg-icon");
let text = document.getElementById("run-info");
let kill = document.getElementById("kill");
ipcRenderer.on("waiting", (event, message)=> {
    text.innerText = message;
    icon.setAttribute("src" ,"../static/icons/waiting.svg");
    kill.hidden = !(message == "正在运行...");
});
ipcRenderer.on("warning", (event, message)=> {
    text.innerText = message;
    icon.setAttribute("src" ,"../static/icons/warning.svg");
    kill.hidden = true;
});
ipcRenderer.on("error", (event, message)=> {
    text.innerText = message;
    icon.setAttribute("src" ,"../static/icons/error.svg");
    kill.hidden = true;
});
ipcRenderer.on("success", (event, message)=> {
    text.innerText = message;
    icon.setAttribute("src" ,"../static/icons/success.svg");
    kill.hidden = true;
});

ipcRenderer.on("fileType", (event, fileType, fileTypeName)=> {
    let model = editor.getModel();
    monaco.editor.setModelLanguage(model, fileType);
    document.getElementById("lang").innerHTML = "&nbsp;" + fileTypeName + "&nbsp;";
});

ipcRenderer.on("encoding", (event, encoding: string)=> {
    document.getElementById("encoding").innerHTML = "&nbsp;" + encoding + "&nbsp;";
});

ipcRenderer.on("ifkill", (event, time)=>{
    if(text.innerText == "正在运行...") {
        icon.setAttribute("src" ,"../styles/cancel.svg");
        text.innerText = "被强行杀死.";
        kill.hidden = true;
    }
})

ipcRenderer.on("font-size", (event, size)=> {
    editor.updateOptions({fontSize: size});
    input.updateOptions({fontSize: size});
    output.updateOptions({fontSize: size});
});

var holder = document.getElementById('drag');
holder.ondragover = function () {
    return false;
};
holder.ondragleave = holder.ondragend = function () {
    return false;
};

holder.ondrop = function (e) {
    e.preventDefault();
    for(let i=0; i<e.dataTransfer.files.length; i++) {
        let file = e.dataTransfer.files[i];
        ipcRenderer.send("drag", file.path);
    }
    return false;
};