# SlicingImport




### Layout


| Folder        | Description                                  |
| ------------- | :------------------------------------------- |
| `src`         | Source                                       |
| `src_dataset` | Source for batch cloning public repositories |
| `src_vuln` | Source for identifying CVEs |
| `src_dataset` | Source for batch cloning public repositories |
| `lib` | SlicedImport Primitive |
| `test_src`    | Example targets for development              |
| `output`      | Webpack-ed dependencies                      |
| `dist`        | Sliced dependencies                          |


### Datasets

| File                        | Description                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `mineableRepositories2.csv` | npm package List - Master Dataset                                                                                         |
| `success.txt`               | List of repositories where slicedImport ran successfully (Independent of tests and of whether anything was sliced at all) |
| `Slicing - Numbers.xlsx`    | `Final numbers used to generate Results and Plots`                                                                        |
| `rq1_output.csv`            | RQ1 dataset                                                                                                               |
| `rq3_output.csv`            | RQ3 dataset                                                                                                               |
| `success_cloc_stats.csv`    | RQ2 dataset                                                                                                               |
| `vulnerability_report.csv` | Raw data for clients where the dependency is tagged with CVEs |


### How to rerun the program

1. Collect the mineable repositories

    ```bash
    node src_dataset/index.mjs
    ```

    Look at the code and you can tweak the number of repos that are being used.
    
    They will get copied to `../cache-repos/repos`.
    `package.json` of each of the files are fetched from npm (so that we dont clone the whole repo) and cached in `../cache-repos`.
2. Get a list of candidate repos that can slice.

    ```bash
    ./script.sh
    ```

    If something goes wrong, add it to the ignore list.
    This also moves the repos into a `candidates/` folder.
    It will create `success.txt` with a list of repos that work with slicing.

3. Slice and get test results

    Go through `success.txt`, and run `master.sh` with each repo.

    `./master.sh cov` -> Get test coverage and pre-test count
    `./master.sh exec` -> Slice and post coverage
    `./master.sh cloc` -> Sliced statistics


    Note that in some cases, the scripts may attempt to execute tests in the backup node modules folder (`.node_modules`). In this case, move it out, and run the tests individually. You can get the commands from the output from the master script (which calls the `script-placer.sh` script).



---

## Vuln finding

The scripts here help find repositories that are - firstly, slicable, and have a direct dependency on a repo that have a github advisory (~CVE) on them. 

From there, you can run the slicer manually to track if they get removed.

Note that it uses the success.txt, not `output`. 
