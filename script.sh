#!/bin/bash
# test repos
IGNORE_REPOS=("source-map-support" "jsdom" "eslint-utils" "polished" "webpack-bundle-analyzer" "jscodeshift" "chromium-bidi" "react-popper" "react-dropzone" "babel-plugin-styled-components" "unicode-trie" "relay-runtime" "react-element-to-jsx-string" "inline-style-prefixer" "karma" "cfb" "serve-handler")  # Add the list of repositories to ignore
# set -e 


function fail {
    printf '%s\n' "$1" >&2 ## Send message to stderr.
    exit "${2-1}" ## Return a code specified by $2, or 1 by default.
}

# rm -rf candidates
mkdir -p candidates
rm -iv processed.log current.log success.txt

# Read the minableRepositories2.csv file (rows of repo,test script). Read the repo and copy it from the `cache` folder`
while IFS=, read -r repo test_script; do

    # Check if the repo is not empty
    if [[ -n "$repo" ]]; then

        # If the repo belongs to a given list, ignore it
        if [[ " ${IGNORE_REPOS[@]} " =~ " ${repo} " ]]; then
            echo "Ignoring repository: $repo"
            continue
        fi    
        # Extract the repo name from the URL
        repo_name=$(basename "$repo" .git)
        
        # Check if the repo directory exists in the cache folder
        if [[ -d "../cache-repos/repos/$repo_name" ]]; then
            echo "Processing repository: $repo_name"
            echo "Processing repository: $repo_name" >> current.log
            # Change to the repository directory
            if [[ -d "candidates/$repo_name" ]]; then
                echo "Repository $repo_name already exists in candidates, skipping..."
                if [[ -f "candidates/$repo_name/.done" ]]; then
                    echo "Skipping $repo_name as it has already been processed."
                    continue
                    else
                        echo "Processing $repo_name again as .done file is missing. Run it again."
                        rm -rf "candidates/$repo_name"
                fi
                # Uncomment the next line if you want to remove the existing directory
                # rm -rf "candidates/$repo_name"
            else 
                cp -r "../cache-repos/repos/$repo_name" "candidates/$repo_name" || exit
                pushd "candidates/$repo_name" > /dev/null || fail "Failed to pushd"
                npm install --silent || fail "Failed to npm i"
                popd > /dev/null || fail "Failed to popd"
                

                node src/index.mjs "candidates/$repo_name"  >> processed.log  2>&1    
                RESULT=$?
                echo "--Separator-- $repo_name" >> processed.log
                touch "candidates/$repo_name/.done"
                if [[ $RESULT -ne 0 ]]; then
                    echo "Error processing repository: $repo_name"
                    # exit $RESULT
                else
                    echo "$repo_name">> "success.txt"
                fi
            fi
            # Change back to the original directory
        else
            echo "Repository $repo_name not found in cache" || exit 1
        fi
    else
        echo "Skipping empty repository entry $repo";
    fi
done < minableRepositories2.csv