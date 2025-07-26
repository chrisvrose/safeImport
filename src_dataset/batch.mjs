import { writeFile,open } from "node:fs/promises";

/**
 * 
 * @template T
 * @template U
 * @param {T[]} items 
 * @param {number} limit 
 * @param {(T)=>Promise<U>} asyncCallback 
 * @returns {Promise<U[]>}
 */
export async function processPromisesBatch(
    items,
    limit,
    asyncCallback,
) {
    const results = [];
    const fileHandle = await open('cache/progress.txt',"w+");
    for (let start = 0; start < items.length; start += limit) {
        const end = start + limit > items.length ? items.length : start + limit;

        const slicedResults = await Promise.all(items.slice(start, end).map(asyncCallback));

        const writePromise = writeFile(fileHandle,transformRes(slicedResults),{flush:true});
        console.log(`[batch] finished batch [${start},${end})`)
        results.push(...slicedResults);
        await writePromise;
    }
    fileHandle.close();

    return results;
}


/**
 * @template T
 * @param {Array<T>} results 
 * @returns {string}
 */
function transformRes(results){
    let str = ""
    for(const x of results){
        str += JSON.stringify(x)+'\n';
    }
    return str;
}