@echo off
setlocal
set npm_config_disturl="https://atom.io/download/electron"
set npm_config_target=4.0.1
set npm_config_runtime="electron"
set npm_config_cache=~\.npm-electron
yarn
endlocal
