#!/bin/bash


uniq_lines=$(sort failed-install.txt | uniq | shuf)

for dir in $uniq_lines; do
    echo "Processing directory: $dir"
    
    if [ -d "../candidates-repos/$dir" ]; then
        pushd "../candidates-repos/$dir" > /dev/null
        echo "Attempting installation in $(pwd)..."
        
        # Replace the following line with your actual install command
        npm install --dry-run
        
        popd > /dev/null
    else
        echo "Directory $dir does not exist, skipping."
    fi

    read -p "Processed $dir Enter to continue to the next directory..."
done