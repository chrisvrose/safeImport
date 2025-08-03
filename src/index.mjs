

import { readFileSync, mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { Project } from 'ts-morph';
import { getSliceAndInfoSync } from 'slice-js/src/slice-code/test/helpers/utils.js';
import path from 'node:path';
import { getImportCallsAndArgumentTypes, isNodeModule, isRelativeModule, logCallList } from './tsCalls.mjs';
import { wpCompress } from './bundle/index.mjs';
import { LibraryTypesRecorder } from './libcalls.mjs';
/**
 * 
 * @param {ReturnType<LibraryTypesRecorder['generateAllArgumentsForRecordedCalls']>} calls 
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

        // console.log(`Sliced code ${moduleName}\n`,slicedCode);
        // continue;
        const writePath = path.resolve('./dist', moduleName, 'index.cjs');
        if (writePath === moduleName) {
            throw Error("Unexpected Directory rewrite. Not allowed.");
        }
        mkdirSync(path.dirname(writePath), { recursive: true });
        console.log(`Writing module '${moduleName}' to '${writePath}'`);

        writePromises.push(writeFile(writePath, slicedCode));

    }

    Promise.all(writePromises).then(p => {
        // console.log("write finished");
    }).catch(console.log);
}

function main() {
    // const FILE_PATH = './test_src/index.cjs';
    const FILE_PATH = './test_src/index.cjs';

    const project = new Project({ compilerOptions: { allowJs: true, checkJs: false, } });
    project.addSourceFileAtPathIfExists(FILE_PATH);

    // const project = tsc.createProgram([FILE_PATH],);
    const checker = project.getTypeChecker();

    const sourceFile = project.getSourceFile(FILE_PATH)

    const importDecls = sourceFile.getImportStringLiterals()
    // foreach library, get a list of import calls

    const calls = getImportCallsAndArgumentTypes(importDecls, checker, FILE_PATH);

    const callMap = calls.generateAllArgumentsForRecordedCalls();

    logCallList(callMap,FILE_PATH);
    sliceAndWriteCalls(callMap, FILE_PATH).then(() => {
        console.log("Slicing and writing calls done");
    });
}

if (process.argv[1] === import.meta.filename) {
    console.log("[SafeImport] started");
    main();
}


