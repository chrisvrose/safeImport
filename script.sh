#!/bin/bash

IGNORE_REPOS=("source-map-support")  # Add the list of repositories to ignore
# set -e 

rm -rf candidates
mkdir -p candidates

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
            echo "Processing repository: $repo_name" > current.log
            # Change to the repository directory
            cp -r "../cache-repos/repos/$repo_name" "candidates/$repo_name" || exit
            pushd "candidates/$repo_name" || exit
            pnpm install || exit
            popd || exit
            

            node src/index.mjs "candidates/$repo_name" >> processed.log        
            RESULT=$?
            if [[ $RESULT -ne 0 ]]; then
                echo "Error processing repository: $repo_name"
                # exit $RESULT
            else
                echo "$repo_name">> "success.txt"
            fi
            # Change back to the original directory
        else
            echo "Repository $repo_name not found in cache" || exit 1
        fi
    fi
done < minableRepositories2.csv