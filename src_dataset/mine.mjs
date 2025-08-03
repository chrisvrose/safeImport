import { existsSync, } from 'fs'
import { lstat, readFile } from 'fs/promises'
import git from 'git-client'
import { resolve } from 'path'
import int from 'set.prototype.intersection';
import { FILTER_LIST } from './FILTER_LIST.mjs';
/**
 * 
 * @param {[string,string,number]} param0 
 * @returns {Promise<[string,string|null]>} second argument is null if ineligible for slicing
 */
export async function cloneRepoAndCheck([repoName, repoGitUrl, downloadCount]) {
    const repoPath = resolve('cache/repos', repoName)

    if (FILTER_LIST.includes(repoGitUrl)) {
        console.log("[git] ignoring ", repoName)
        return [repoName, null]
    };
    // console.log('[git] fetching',repoName, repoGitUrl);
    await cacheCloneIdempotently(repoPath, repoName, repoGitUrl)

    const tsConfigFileLocation = resolve(repoPath,'tsconfig.json');
    const tsConfigFileExists = existsSync(tsConfigFileLocation);
    if(tsConfigFileExists) return [repoName, null];


    const packageFile = resolve(repoPath, 'package.json')
    if (!existsSync(packageFile)) return [repoName, null];
    const packageJSONContentsString = (await readFile(packageFile)).toString()

    // console.log(packageJSONContentsString);
    const packageJSONContents = JSON.parse(packageJSONContentsString)
    // console.log(repoName, packageJSONContents.license)
    if(!hasAnyActualDependencies(packageJSONContents, repoName)) {
        console.log("[git] skipping", repoName, "has no dependencies");
        return [repoName, null];
    }

    const hasDependencies = checkTestingDependencies(packageJSONContents, repoName);
    if (hasDependencies)
        return [repoName, ((packageJSONContents?.scripts?.test))]
    else return [repoName, null]
}
function hasAnyActualDependencies(packageJSONContents, repoName) {
    if (packageJSONContents.dependencies !== undefined && Object.keys(packageJSONContents.dependencies).length > 0) {
        return true;
    }
    return false;
}

function checkTestingDependencies(packageJSONContents, repoName) {
    const testingLibraries = new Set(['mocha', 'istanbul']);
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
            
        }
    } else {
        console.log("[git] cloning", repoGitUrl);
        await git.clone(repoGitUrl, repoPath,{'single-branch':true,depth:1})
    }
}
