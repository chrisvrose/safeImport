
// rq2
// iterate through success.txt, and gather tree stats and cloc stats

import { readFile ,writeFile, rename} from "fs/promises";
import {promisify} from 'node:util'
import { exec } from 'node:child_process';
import { processPromisesBatch } from "../batch.mjs";
import { cacheFunctionOutput } from "../cache.mjs";
import {stringify} from 'csv/sync'
// import {  existsSync, } from "node:fs";
// import { getTreeStatsOfProject } from "../../src_deptree/index.mjs";
const execP = promisify(exec);


const text = (await readFile('success.txt')).toString();

const repos = text.trim().split('\n');

const repoCountsCached = await cacheFunctionOutput('repoClocCounts.json',async ()=>{
    const repoCounts = await processPromisesBatch(repos,32,getData);
    return repoCounts;
},true, true);
// console.log(repoCountsCached)

// console.log(x)
const vals = repoCountsCached.map((v,i)=>{
    return [repos[i],v?.baseline?.code,v?.webpack?.code,v?.slicejs?.code]
})


const valsString = stringify(vals,{header:true,columns:['repo','baselineLines','webpackLines','slicejsLines']})




console.log(valsString)
await writeFile('success_cloc_stats.csv',valsString)

/**
 * Run cloc --json on the repo, and return the json parsed.
 * @param {string} repo 
 */
async function getData(repo){
    const baseline = execP(`cloc --json output/${repo} --exclude-ext=optimized.cjs | jq "{nFiles:.JavaScript.nFiles,code:.JavaScript.code}"`)
    // this is webpacked code
    const e1Promise = execP(`cloc --json output/${repo} --exclude-ext=bundle.cjs | jq "{nFiles:.JavaScript.nFiles,code:.JavaScript.code}"`)
    // this is sliced code
    const e2Promise = execP(`cloc --json dist/${repo} | jq "{nFiles:.JavaScript.nFiles,code:.JavaScript.code}"`)
    // const e3Promise = verifyTreeStats(repo);
    const [{stdout},{ stdout:stdPost },{stdout:baselineStdOut}] = await Promise.all([e1Promise,e2Promise, baseline]);
    // console.log("haha",repo)
    /** @typedef {{nFiles:number|null,code:number|null}} CodeInfo */
    /** @type {CodeInfo} */
    const stdOutObj = JSON.parse(stdout);
    /** @type {CodeInfo} */
    const stdPostObj = JSON.parse(stdPost);
    /** @type {CodeInfo} */
    const baselineObj = JSON.parse(baselineStdOut);
    // assertFilesContained(stdOutObj, repo);
    // assertFilesContained(stdPostObj, repo);
    // if(repo==='mime-types'){
    //     console.log('AAAA',stdPostObj.code,stdOutObj.code)
    // }
    return {repoName: repo,webpack:stdOutObj,slicejs:stdPostObj,baseline:baselineObj};
}

// async function verifyTreeStats(repo){
//     if(!existsSync(`../candidates-repos/${repo}`)){
//         console.warn(`Repo ${repo} does not exist in candidates-repos, cannot get tree stats`);
//         return {depth:null,width:null};
//     }
//     const existsOriginal = existsSync(`../candidates-repos/${repo}/node_modules`);
//     const existsHidden = existsSync(`../candidates-repos/${repo}/.node_modules`);
//     if(!existsOriginal && !existsHidden){
//         const npmFailFilterList = ['yargs-unparser','payment','vue-shortkey']
//         if(npmFailFilterList.includes(repo)) {
//             return {depth:null,width:null};
//         }
//         console.log(`Repo ${repo} does not have node_modules or .node_modules, cannot get tree stats`);
//         await npmInstall(`../candidates-repos/${repo}`);
//     }
//     if(!existsOriginal && existsHidden){
//         await rename(`../candidates-repos/${repo}/.node_modules`, `../candidates-repos/${repo}/node_modules`);
//     }
//     /** @type {{depth: number|null,width:number|null}} */
//     let res = {depth:null,width:null};
//     try{
//         res = await getTreeStatsOfProject(`../candidates-repos/${repo}`);

//     }catch(e){}
//     if(!existsOriginal && existsHidden){
//         await rename(`../candidates-repos/${repo}/node_modules`, `../candidates-repos/${repo}/.node_modules`);
//     }
//     return res;
// }

// async function npmInstall(repoPath){
//     const {stdout} = await execP(`pushd ${repoPath} && npm i`)
//     console.log(`Installing dependencies`,stdout.trim());
// }

// function assertFilesContained(stdOutObj, repo) {
//     if (stdOutObj.nFiles === 0 || stdOutObj?.nFiles === undefined || stdOutObj?.nFiles === null) {
//         console.error(stdOutObj);
//         throw new Error(`cloc pre failed for ${repo} - no files counted`);
//     }
//     if(stdOutObj?.code ===undefined || stdOutObj?.code === null){
//         console.error(stdOutObj);
//         throw new Error(`cloc pre failed for ${repo} - no code field`);
//     }
// }
