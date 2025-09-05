#!/bin/bash

# This script processes a given repository by replacing its node_modules with the ones from the dist folder.
# The dist folder is expected to contain the base folder name of the repository, then inside that will be sliced dependencies.
# Usage: ./script-placer.sh <repo_location>
set -x
fail() {
    echo "Error: $1"
    exit "${2-1}" ## Return a code specified by $2, or 1 by default.
}

REPO_FOLDER="$1"
REPO_BASE=$(basename "$REPO_FOLDER")
if [[ -z "$REPO_FOLDER" ]]; then
    echo "Usage: $0 <repo_location>"
    exit 1
fi

pushd "$REPO_FOLDER"
npm i || fail "Failed to install dependencies"
rm -rf .node_modules node_modules_2
timeout 5m npm run test >> ../coverage/$REPO_BASE-pre.json
# less ../coverage/$REPO_BASE-pre.json
if [[ $? -ne 0 ]]; then
    echo "Tests failed in $REPO_FOLDER"
    echo "$REPO_FOLDER" >> ../coverage/pre-failed.txt
fi
popd


echo "Processing repository at: $REPO_FOLDER"

node src/index.mjs "$REPO_FOLDER" 
PRE_TEST_RESULT=$?
if [[ $PRE_TEST_RESULT -ne 0 ]]; then
    fail "Error processing repository: $REPO_FOLDER"
fi

pushd "$REPO_FOLDER"
mv node_modules .node_modules
NODE_PATH="/home/atreyab/Documents/Docs/SlicingImport/repos-js/safeImport/dist/$REPO_BASE:/home/atreyab/Documents/Docs/SlicingImport/repos-js/candidates-repos/$REPO_BASE/.node_modules" timeout 5m npm run test #>> ../coverage/$REPO_BASE-post.txt
# less ../coverage/$REPO_BASE-post.txt
POST_TEST_RESULT=$?
# if post test is true, or both are false, then we can proceed
if [[ $POST_TEST_RESULT -ne 0 && $PRE_TEST_RESULT -ne 0 ]]; then
    echo "something"
    echo $REPO_FOLDER >> ../coverage/failed.txt
    # exit 1
fi
if [[ $POST_TEST_RESULT -eq 0 ]]; then
    echo "$REPO_BASE" >> ../coverage/success.txt
    echo "Successfully processed $REPO_BASE"
fi
popd

