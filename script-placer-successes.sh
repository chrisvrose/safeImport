#! /bin/bash

## Run the script-placer.sh for each repository in the success.txt file

while read -r repo; do
    if [[ -n "$repo" ]]; then
        # echo "Running script-placer.sh for repository: candidates/$repo"
        ./script-placer.sh "../candidates-repos/$repo" || echo "Failed to process $repo"
    else
        echo "Skipping empty repository entry"
    fi
done < success.txt