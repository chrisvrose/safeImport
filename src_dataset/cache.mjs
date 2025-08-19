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
export async function cacheFunctionOutput(fileName, asyncCallback, silent=false,passthrough=false) {
    const fileLoc = resolve('../cache-repos', fileName);
    if (!passthrough && existsSync(fileLoc)) {
        !silent && console.log("[cacher] Using cached ", fileLoc);
        const fileContents = (await readFile(fileLoc)).toString();
        return JSON.parse(fileContents);
    } else {
        !silent && console.log("[cacher] cache miss")
        const returnRes = await asyncCallback();
        const fileContents = JSON.stringify(returnRes);
        await writeFile(fileLoc,fileContents);
        !silent && console.log("[cacher] saved ",fileLoc)
        return returnRes;
    }
}