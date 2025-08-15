import { existsSync, } from 'fs'
import { lstat, readFile,rm } from 'fs/promises'
import git from 'git-client'
import { resolve } from 'path'
import int from 'set.prototype.intersection';
import { matchFilterList } from './FILTER_LIST.mjs';
import npmapi from 'npm-api'
import { cacheFunctionOutput } from './cache.mjs';
/**
 * 
 * @param {[string,string,number]} param0 
 * @returns {Promise<[string,string|null]>} second argument is null if ineligible for slicing
 */
export async function cloneRepoAndCheck([repoName, repoGitUrl, downloadCount]) {
    const repoPath = resolve('../cache-repos/repos', repoName)

    if (filterRepo(repoGitUrl)) {
        console.log("[git] ignoring ", repoName)
        return [repoName, null]
    };
    // console.log('[git] fetching',repoName, repoGitUrl);
    let api = new npmapi();
    const repo = api.repo(repoName);

    let packageJSONContentsString = null;


    try{
        packageJSONContentsString = await cacheFunctionOutput(`cache-repo-package-json-${repoName.replaceAll('/',"_sl_")}.json`,async ()=> JSON.stringify(await repo.package()),true);
        // console.log("[git] fetched package.json for", repoName);
    }catch(e){
        throw new Error(`Failed to fetch package.json for ${repoName} from npm: ${e.message}`);
    }

    if (packageJSONContentsString === undefined || packageJSONContentsString === null) {
        throw new Error(`Failed to fetch package.json for ${repoName} from npm`);
    // console.log("[git] checking", repoName, "for dependencies at ", packageFile);
    // const packageJSONContentsString = (await readFile(packageFile)).toString()
    }

    // console.log(packageJSONContentsString);
    const packageJSONContents = JSON.parse(packageJSONContentsString)
    // console.log(repoName, packageJSONContents.license)
    if (!hasAnyActualDependencies(packageJSONContents, repoName)) {
        // console.log("[git] skipping", repoName, "has no dependencies");
        return [repoName, null];
    }

    const hasDependencies = checkTestingDependencies(packageJSONContents, repoName);
    if (hasDependencies) {
        await cacheCloneIdempotently(repoPath, repoName, repoGitUrl);

        const tsConfigFileLocation = resolve(repoPath, 'tsconfig.json');
        const tsConfigFileExists = existsSync(tsConfigFileLocation);
        if (tsConfigFileExists){
            // console.warn("[git] Ignoring ", repoName, "because it has a tsconfig.json file.");
            return [repoName, null];
        }
        const packageFile = resolve(repoPath, 'package.json')
        if (!existsSync(packageFile)){
            console.warn("[git] Unexpected package.json not found in", repoName, "at", packageFile);
            return [repoName, null];}

        // finally, return the test script if it exists
        return [repoName, ((packageJSONContents?.scripts?.test))]
    }
    else return [repoName, null]
}


function filterRepo(repoGitUrl) {
    return matchFilterList(repoGitUrl);
}

function hasAnyActualDependencies(packageJSONContents, repoName) {
    if (packageJSONContents.dependencies !== undefined && Object.keys(packageJSONContents.dependencies).length > 0) {
        return true;
    }
    return false;
}

function checkTestingDependencies(packageJSONContents, repoName) {
    const testingLibraries = new Set(['mocha','jest']);
    const dependencies = new Set();
    if (packageJSONContents.dependencies !== undefined) {
        for (const dep of Object.keys(packageJSONContents.dependencies)) {
            dependencies.add(dep)
        }
    }
    if (packageJSONContents.devDependencies !== undefined) {
        for (const dep of Object.keys(packageJSONContents.devDependencies)) {
            dependencies.add(dep)
        }
    }

    // console.log(dependencies)
    /**
     * @type {Set}
     */
    const x = int(testingLibraries, dependencies);
    // console.log(`join`, x)
    return x.size > 0;

}

async function cacheCloneIdempotently(repoPath, repoName, repoGitUrl) {
    if (existsSync(repoPath)) {
        const isDir = (await lstat(repoPath)).isDirectory()
        if (!isDir) throw new Error(repoName, " is mangled. delete directory and re-clone.")
        else {
            // const path = await git.status({ $cwd: repoPath })
            // console.log("[git] already cloned", repoName, "at", repoPath);
        }
    } else {
        console.log("[git] cloning", repoGitUrl);
        await git.clone(repoGitUrl, repoPath, { 'single-branch': true, depth: 1 })
    }
}
