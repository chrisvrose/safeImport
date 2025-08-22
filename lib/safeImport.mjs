import path from 'node:path';
import {} from '../src/index.mjs'
import {createRequire} from 'node:module'



/*
    Base Requirements:
    - Should work in atleast CJS contexts.
 */

/**
 * 
 * @param {string} modulePath 
 */
export function safeImport(modulePath) {
    const moduleDistPath = path.resolve('/home/atreyab/Documents/Docs/SlicingImport/repos-js/safeImport/dist');
    const requestedModulePath = path.resolve(moduleDistPath, modulePath);
    // const executingModuleName = path.basename(path.resolve(modulePath));
    // console.log(requestedModulePath)
    const x = createRequire(moduleDistPath);
    return x;
}
const x = safeImport('parsejson');
console.log("x",x);