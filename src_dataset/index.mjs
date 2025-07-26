import * as csv from 'csv'
import fsp from 'fs/promises'
import { cloneRepoAndCheck } from './mine.mjs';
import { cacheFunctionOutput } from './cache.mjs';
import { processPromisesBatch } from './batch.mjs';



const intermediateRepoList = await cacheFunctionOutput('repos.json', async function () {
    const [packagesM, packageReposM] = await Promise.all([
        import('download-counts', { with:{type: 'json'}}),
        import('all-the-package-repos', { with: { type: 'json' } })
    ]);
    const packages = packagesM.default;
    const packageRepos = packageReposM.default;

    const packageList = Object.keys(packages).map(e => [e, packages[e]])
        .filter(e => e[1] > 100).filter(e => !e[0].startsWith("@types/"))
    console.log('packagelist', packageList.length)
    /**
     * @type {[string,string,number][]} repo, link count
     */
    const withRepos = packageList.map(e => [e[0], packageRepos[e[0]], e[1]])
    console.log('withrepos', withRepos.length);
    const withExactRepos = withRepos.filter(e => ((e[1]) !== null && (e[1]) !== undefined && (e[1]) !== ""))
    console.log('withreposCleaned', withExactRepos.length);
    withExactRepos.sort((a,b)=>(-a[2]+b[2]))
    return withExactRepos;
})
// const packageMap = new Map(packageList)

console.log(intermediateRepoList.length)
const intermediateRepoListSmaller = intermediateRepoList.slice(0,2000);

const repoStatus = await processPromisesBatch(intermediateRepoListSmaller,15,cloneRepoAndCheck)

const repoStatusString = csv.stringify(repoStatus);
await fsp.writeFile('repostatus.csv', repoStatusString);

const minableRepositories = repoStatus.filter(e=>(e!==null && e?.[1]));
const output = csv.stringify(minableRepositories);
await fsp.writeFile('minableRepositories2.csv', output);
// console.log("written results")

