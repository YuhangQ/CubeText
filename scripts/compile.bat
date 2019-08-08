@echo off
g++ "%1" -o "%2"

If errorlevel 1 (
    Echo #compile_error
) Else (
    Echo #compile_success
)