
import assert from 'node:assert';
import { getASTAndScope } from './ast/analysis.mjs';

import { getRequireCallsAndConstantArgs } from './calls.mjs';
import { analyze, instrumentString, instrumentDir } from 'jalangi2';
import { readFileSync ,realpathSync ,mkdirSync} from 'node:fs';
import { writeFile } from 'node:fs/promises';

import {getSliceAndInfoSync} from 'slice-js/src/slice-code/test/helpers/utils.js';
import path, { dirname,join } from 'node:path';
/**
 * Call parameter generation
 */
function main() {
    const FILE_PATH = './test_src/index.cjs';
    const { scopeManager, _parsedModAST } = getASTAndScope(FILE_PATH);
    assert(scopeManager.scopes.length >= 2, "expected atleast global and module scope");
    assert(scopeManager.scopes[1].type === 'function', "expected the 'module' scope to have function scope");

    const calls = getRequireCallsAndConstantArgs(scopeManager);

    logCallList(calls);

    const writePromises = [];
    for (const [moduleName, callBox] of calls) {
        if (!isRelativeModule(moduleName)) { // not relative module
            continue;
        }

        const relatedModuleNamePath = join(realpathSync(dirname(FILE_PATH)) ,moduleName);
        const fileSource = readFileSync(relatedModuleNamePath).toString('utf-8');
        const {slicedCode} = getSliceAndInfoSync(fileSource, (moduleExports) => {
            return [...callBox.entries()].flatMap(([methodName, methodArgsList])=>{
                const methodNameNormed = methodName.substring(1);
                console.log("Calls for ",methodNameNormed,methodArgsList)
                return methodArgsList.map(methodArgsList=>{
                    const methodObj = methodNameNormed===''?moduleExports:moduleExports[methodNameNormed];
                    methodObj.apply(moduleExports[methodNameNormed],methodArgsList)
                });
            })
        },relatedModuleNamePath);
        // console.log(`Sliced code ${moduleName}\n`,slicedCode);
        const writePath = path.resolve('./dist', moduleName);
        if(writePath===moduleName){
            throw Error("Will overwrite!!!!");
        }
        mkdirSync(path.dirname(writePath),{recursive: true});
        console.log(`Writing to`,writePath);

        writePromises.push(writeFile(writePath,slicedCode));
        
    }

    Promise.all(writePromises).then(p=>{
        console.log("write finished")
    }).catch(console.log);
}

if (process.argv[1] === import.meta.filename) {
    console.log("[SafeImport] started")
    main();
}


function logCallList(calls) {
    for (const [moduleName, callBoxes] of calls.entries()) {
        if (isRelativeModule(moduleName)) {
            console.log('Importing', moduleName, callBoxes);
        } else {
            console.log(`Module "${moduleName}" - System module. FIXME skipping`);
        }
    }
    console.log(`Call List`, calls);
}

function isRelativeModule(moduleName) {
    return moduleName.startsWith('.');
}

