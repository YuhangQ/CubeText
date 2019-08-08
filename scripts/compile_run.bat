@echo off
g++ "%1" -o "%2"

If errorlevel 1 (
    Echo #compile_error
) Else (
    Echo #compile_success
    "%2" < "%3"
    If errorlevel 1 (
        Echo #run_error
    ) Else (
        Echo #run_success
    )
)
