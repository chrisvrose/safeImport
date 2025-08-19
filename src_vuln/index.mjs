import { readFile } from "fs/promises";
import { cacheFunctionOutput } from "../src_dataset/cache.mjs";
import { bifurcateArray, getGithubTokenFromEnvironment } from "./lib.mjs";
import { checkForParentDep, findSlicedDeps } from "./slicedeps.mjs";
import { basename } from "path";
import int from 'set.prototype.intersection'
const githubToken = getGithubTokenFromEnvironment();

const vulnTargets = await findSlicedDeps();
const affects = [...vulnTargets].join(',');

console.log(vulnTargets.size, "sliced deps found");

const res = await cacheFunctionOutput('advisories.json', async () => {
    const query = `?ecosystem=npm&affects=${encodeURIComponent(affects)}`;
    // console.log('query',query);
    const res = await fetch('https://api.github.com/advisories'+query,
        {
            headers:{
                Authorization: `Bearer ${githubToken}`,
            }
        }
    );
    const x = await res.json();
    return x;
},true, true);

const cveMap = res.map(e=>({
        summary: e.summary,
        source: e.source_code_location,
        severity: e.severity,
        repo_name: basename(e.source_code_location),
        cve: e.cve_id,
        identifiers: e.identifiers,
        cvss: e.cvss,
    }));

const [fullMaps,emptyMap]= bifurcateArray(cveMap, (e)=>e.source)


// const slicedReposSoFar = await findSlicedDepsSoFar();
const depMap = new Map();
for(const depo of fullMaps){
    if(!depMap.has(depo.repo_name)) {
        depMap.set(depo.repo_name, []);
    }
    depMap.get(depo.repo_name).push(depo);
}
const depKeys = ([...depMap.keys()])
// console.log(depKeys)
const repoKeys = await checkForParentDep(depKeys);
console.log(repoKeys, 'repos found with CVE-ridden direct dependencies');
// for(const repo of slicedReposSoFar) {
//     const deps = await getDepsOfRepo(repo);
//     console.log(repo,deps);
//     const depCVEs = fullMaps.filter(e=>(deps).includes(e.repo_name));
//     depMap.set(repo, depCVEs);
// }
// console.log(cveMap.length, "advisories found");
// console.log(fullMaps.length, " actionable advisories found");
// console.log(emptyMap.length, "advisories found");
// what is pending
// see what's been sliced so far. Find their dependencies, link back to 

const successRepos = new Set((await readFile('success.txt')).toString().trim().split('\n'));
// console.log("success with ",successRepos.size)
const intSet = int (successRepos,repoKeys)
console.log("Anything right now? ",intSet)




