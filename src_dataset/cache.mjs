import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * 
 * @template T
 * @param {string} fileName 
 * @param {()=>Promise<T>} asyncCallback 
 * @returns {Promise<T>}
 */
export async function cacheFunctionOutput(fileName, asyncCallback) {
    const fileLoc = resolve('./cache', fileName);
    if (existsSync(fileLoc)) {
        console.log("[cacher] Using cached ", fileLoc);
        const fileContents = (await readFile(fileLoc)).toString();
        return JSON.parse(fileContents);
    } else {
        console.log("[cacher] cache miss")
        const returnRes = await asyncCallback();
        const fileContents = JSON.stringify(returnRes);
        await writeFile(fileLoc,fileContents);
        console.log("[cacher] saved ",fileLoc)
        return returnRes;
    }
}