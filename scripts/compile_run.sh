g++ "$1" -o "$2"

if [ $? -eq 0 ]; then
    echo "#compile_success"
    "$2" < "$3"
    if [ $? -eq 0 ]; then
        echo "#run_success"
    else
        echo "#run_error"
    fi
else
    echo "#compile_error"
fi