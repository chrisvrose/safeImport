


REPO_BASE="mime-types"

REPO_FOLDER="../candidates-repos/$REPO_BASE"

fail() {
    echo "Error: $1"
    exit "${2-1}" ## Return a code specified by $2, or 1 by default.
}

if [[ -d "$REPO_FOLDER" ]]; then
    echo ""
else
    fail "Repository folder does not exist: $REPO_FOLDER"
fi

INPUT_FUNCTION="$1"

if [[ -z "$INPUT_FUNCTION" ]]; then
    fail "No input function provided. Usage: $0 <input_function>"
fi

echo "Input function: $INPUT_FUNCTION";

case "$INPUT_FUNCTION" in
    "pre-test")
        pushd "$REPO_FOLDER"
        read -p "Deleting old node_modules_2 directory?" choice
        if [[ "$choice" == "y" || "$choice" == "Y" ]];
        then
            rm -rf node_modules_2
        else
            echo "Skipping deletion of node_modules_2"
        fi
        npm i --silent || fail "Failed to install dependencies"
        npm run test
        popd 
        ;;
    "rollback")
        pushd "$REPO_FOLDER"
        # Move node_modules_2 back to node_modules
        if [[ -d "node_modules_2" ]]; then
            echo "Restoring node_modules from node_modules_2"
            rm -irf node_modules
            mv node_modules_2 node_modules
        else
            fail "node_modules_2 does not exist, cannot rollback"
        fi
        popd
        ;;
    "indeps")
        # Inactivate the repo by moving node_modules to node_modules_2
        pushd "$REPO_FOLDER"
        mv node_modules node_modules_2
        popd
        ;;
    "stat")
        # Generate dependency statistics
        pushd "$REPO_FOLDER" >> /dev/null
        if [[ ! -d "node_modules" ]]; then
            echo "node_modules directory does not exist"
        else
            echo "node_modules directory exists"
        fi
        if [[ ! -d "node_modules_2" ]]; then
            echo "node_modules_2 directory does not exist"
            else
            echo "node_modules_2 directory exists"
        fi
        popd >> /dev/null
        ;;
    "cov")
        pushd "$REPO_FOLDER"
        npm i --silent || fail "Failed to install dependencies"
        npm i -D @types/node || fail "Failed to install node types"
        nyc npm run test 
        ;;
    "exec")

        ./script-placer.sh "$REPO_FOLDER"
        OVERALL_RESULT=$?
        if [[ $OVERALL_RESULT -ne 0 ]]; then
            fail "script-placer.sh failed with exit code $OVERALL_RESULT"
        else
            echo "script-placer.sh executed successfully."
        fi
        ;;
    *)
        fail "Unknown function: $INPUT_FUNCTION. Supported functions: test, build."
        ;;

esac