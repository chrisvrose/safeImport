

import { readFileSync ,realpathSync ,mkdirSync} from 'node:fs';
import { writeFile } from 'node:fs/promises';
import tsm, { Project, SyntaxKind ,ts} from 'ts-morph';
import {getSliceAndInfoSync} from 'slice-js/src/slice-code/test/helpers/utils.js';
import path, { dirname,join } from 'node:path';
import { getImportCallsAndArgumentTypes } from './tsCalls.mjs';
import { LibraryCallsRecorder } from './libcalls.mjs';
import { wpCompress } from '../src_bundle/index.mjs';
/**
 * 
 * @param {LibraryCallsRecorder['calls']} calls 
 * @param {string} FILE_PATH 
 */
export async function sliceAndWriteCalls(calls, FILE_PATH) {
    const writePromises = [];

    for (const [moduleName, callBox] of calls) {
        if (isRelativeModule(moduleName) || isNodeModule(moduleName)) { // not relative module
            console.warn(`Skipping module ${moduleName} - relative or inbuilt Node.js module`);
            continue;
        }
        console.log(`Slicing module ${moduleName} - ${callBox.size} calls`);
        
        // const relatedModuleNamePath = import.meta.resolve(moduleName);
        // console.log(`Related module path`, relatedModuleNamePath);
        
        const relatedModuleNamePath = await wpCompress(moduleName)
        const fileSource = readFileSync(relatedModuleNamePath).toString('utf-8');
        // continue; // TODO - handle relative modules
        const { slicedCode } = getSliceAndInfoSync(fileSource, (moduleExports) => {
            return [...callBox.entries()].flatMap(([methodName, methodArgsList]) => {
                const methodNameNormed = methodName.substring(1);
                console.log("Calls for ", methodNameNormed, methodArgsList);
                return methodArgsList.map(methodArgsList => {
                    const methodObj = (methodNameNormed === '') ? moduleExports : moduleExports[methodNameNormed];
                    methodObj.apply(moduleExports[methodNameNormed], methodArgsList);
                });
            });
        }, relatedModuleNamePath);
        
        console.log(`Sliced code ${moduleName}\n`,slicedCode);
        continue;
        const writePath = path.resolve('./dist', moduleName);
        if (writePath === moduleName) {
            throw Error("Unexpected Directory rewrite. Not allowed.");
        }
        mkdirSync(path.dirname(writePath), { recursive: true });
        console.log(`Writing to`, writePath);

        writePromises.push(writeFile(writePath, slicedCode));

    }

    Promise.all(writePromises).then(p => {
        console.log("write finished");
    }).catch(console.log);
}

function main() {
    // const FILE_PATH = './test_src/index.cjs';
    const FILE_PATH = './test_src/index.mjs';

    const project = new Project({compilerOptions:{allowJs: true, checkJs: false,}});
    project.addSourceFileAtPathIfExists(FILE_PATH);

    // const project = tsc.createProgram([FILE_PATH],);
    const checker = project.getTypeChecker();

    const sourceFile = project.getSourceFile(FILE_PATH)

    const importDecls = sourceFile.getImportStringLiterals()
    // foreach library, get a list of import calls
    
    const calls = getImportCallsAndArgumentTypes(importDecls,checker,FILE_PATH);

    const callMap = calls.generateAllArgumentsForRecordedCalls();
    
    logCallList(callMap);
    sliceAndWriteCalls(callMap, FILE_PATH).then(()=>{
        console.log("Slicing and writing calls done");
    });
}

if (process.argv[1] === import.meta.filename) {
    console.log("[SafeImport] started");
    main();
    console.log("done");
}


export function logCallList(calls) {
    console.log(`[Call Log] Call List for ${calls.size} modules`);
    for (const [moduleName, callBoxes] of calls.entries()) {
        if (isRelativeModule(moduleName)) {
            console.log('Importing', moduleName, callBoxes);
        } else {
            console.log(`Module "${moduleName}" - System module. FIXME skipping`);
        }
    }
    console.log(`Call List`, calls);
    console.log(`[Call Log] End List for ${calls.size} modules`);

}

function isRelativeModule(moduleName) {
    return moduleName.startsWith('.');
}

/**
 * True if an inbuilt Node.js module.
 * @param {string} moduleName 
 * @returns 
 */
function isNodeModule(moduleName) {
    if(moduleName.startsWith('node:')) return true;
    const nodeModules = ['fs', 'fs/promises', 'path', 'http', 'https', 'os', 'crypto']
    return nodeModules.includes(moduleName);
}