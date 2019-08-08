g++ "$1" -o "$2"

if [ $? -eq 0 ]; then
    echo "#compile_success"
else
    echo "#compile_error"
fi