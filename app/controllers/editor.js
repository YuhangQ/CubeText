"use strict";
exports.__esModule = true;
var ace = require("ace-builds/src-noconflict/ace");
ace.config.set("basePath", __dirname + "/../../node_modules/ace-builds/src-noconflict");
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/c_cpp");
editor.setFontSize(18);
editor.setValue("#include <cstdio>\nusing namespace std;\nint main() {\n    printf(\"Hello World!\\n\");\n    return 0;\n}");
