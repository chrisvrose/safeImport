import { readdir, opendir } from 'node:fs/promises'
import path, { basename, dirname } from 'node:path';



/**
 * Finds all dependencies that are sliced by the slicer.
 * this function will search find the list of dependencies that are sliced by the slicer.
 * in the dist folder, theres a folder of repos. in that, there is a folder for each dependency.
 * collate into a set and return it.
 * Eg.
 * dist/
 *  └── align-text/
 *     └── kind-of
 *    └── longest
 * 
 * it will return kind-of and longest as sliced deps.
 */
export async function findSlicedDeps(){
    /**
     * @type {Set<string>}
     */
    const slicedDeps = new Set();
    const distPath = path.resolve('dist');
    
    for await(const p of walk(distPath)) {
        if(p.endsWith("package.json")) {slicedDeps.add(basename(dirname(p)))}
        else continue;
    }
    return slicedDeps;
}

/**
 * Given a list of deps, find the repos that have these
 * @param {string[]} dependencies 
 */
export async function checkForParentDep(dependencies){
    // dep -> main
    const map = await getReverseDeps();
    const reposet = dependencies.flatMap(dep => (map.get(dep)??[]));
    const repos = new Set(reposet);
    return repos;
}

// for a given dep, find the list of main repo that has this dep. return map.
async function getReverseDeps() {
    const x = new Map();
    const distPath = path.resolve('dist');

    for await(const p of walk(distPath)) {
        if (p.endsWith("package.json")) {
            const repo = basename(dirname(dirname(p)));
            const depName = basename(dirname(p));

            if (!x.has(depName)) {
                x.set(depName, []);
            }
            x.get(depName).push(repo);
            // console.log(p,repo, depName);
        }
        else continue;
    }
    return x;
}

export async function findSlicedDepsSoFar() {
    // return all folder names in the output directory.
    const distPath = path.resolve('output');
    const dirEntries = await readdir(distPath, { withFileTypes: true });
    const repos = dirEntries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
    return repos;
}
/**
 * 
 * @param {string} repo 
 */
export async function getDepsOfRepo(repo){
    const distPath = path.resolve('output', repo);
    const dirEntry = await readdir(distPath, { withFileTypes: true });
    const deps = dirEntry.filter(dirent => dirent.isFile()).map(dirent => dirent.name.replace('.bundle.cjs',''));
    return deps;
}

/**
 * FS walk primitive
 * Ref: https://gist.github.com/lovasoa/8691344
 * @param {string} dir 
 * @returns {AsyncGenerator<string>}
 */
async function* walk(dir) {
    for await (const d of await opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) yield* walk(entry);
        else if (d.isFile()) yield entry;
    }
}
// checkForParentDep('thenify', 'glob-parent', 'terser', 'url-parse').then(console.log).catch(console.error);