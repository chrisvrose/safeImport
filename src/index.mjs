

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
 * @param {string} folderPath
 */
export async function sliceAndWriteCalls(calls, folderPath) {
    const writePromises = [];

    for (const [moduleName, callBox] of calls) {
        if (isRelativeModule(moduleName) || isNodeModule(moduleName)) { // not relative module
            console.warn(`Skipping module ${moduleName} - relative or inbuilt Node.js module`);
            continue;
        }
        console.log(`Slicing module ${moduleName} - ${callBox.size} calls`);

        // const relatedModuleNamePath = import.meta.resolve(moduleName);
        // console.log(`Related module path`, relatedModuleNamePath);
        console.log("[wp] Compressing module", moduleName);
        // throw Error("Module slicing not implemented yet");
        const relatedModuleNamePath = await wpCompress(moduleName,folderPath );
        const fileSource = readFileSync(relatedModuleNamePath).toString('utf-8');
        // continue; // TODO - handle relative modules
        const { slicedCode } = getSliceAndInfoSync(fileSource, (moduleExports) => {
            return [...callBox.entries()].flatMap(([methodName, methodArgsList]) => {
                const methodNameNormed = methodName.substring(1);
                console.log("Calls for ", methodNameNormed, methodArgsList);
                return methodArgsList.map(methodArgsList => {
                    const methodObj = (methodNameNormed === '') ? moduleExports : moduleExports[methodNameNormed];
                    if(methodObj === undefined) {
                        console.warn(`Method ${methodNameNormed} not found in module ${moduleName}`);
                        return;
                    }
                    try{
                        methodObj.apply(moduleExports[methodNameNormed], methodArgsList);
                    } catch(e) {
                        console.warn(`Error calling method ${methodNameNormed} with args ${methodArgsList} in module ${moduleName}`, e);
                        return;
                    }      
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

// is-glob WORKED
/**
 * 
 * @param {string} filePath 
 */
function driver(folderPath = './candidates/braces') {
    // const FILE_PATH = './test_src/index.cjs';

    const project = new Project({ compilerOptions: { allowJs: true, checkJs: false, } });

    const scriptGlobs = constructJavascriptGlobInFolder(folderPath)
    project.addSourceFilesAtPaths(scriptGlobs);
    const sourceFiles = project.getSourceFiles()

    const libraryTypesRecorder = new LibraryTypesRecorder(project.getTypeChecker());
    // const project = tsc.createProgram([FILE_PATH],);
    const checker = project.getTypeChecker();
    console.log(`Source files found: ${sourceFiles.length}`, ...sourceFiles.map(sf => sf.getFilePath()));
    for (const sourceFile of sourceFiles) {
        const filePath = sourceFile.getFilePath();
        console.log(`[analyzer] Processing file: ${filePath}`);
        
        const importDecls = sourceFile.getImportStringLiterals()
        // foreach library, get a list of import calls
        
        getImportCallsAndArgumentTypes(importDecls, checker, filePath,libraryTypesRecorder);
    }

    const callMap = libraryTypesRecorder.generateAllArgumentsForRecordedCalls();


    logCallList(callMap, folderPath);
    sliceAndWriteCalls(callMap, folderPath).then(() => {
        console.log("Slicing and writing calls done");
    });
}

if (process.argv[1] === import.meta.filename) {
    if(process.argv.length >2 && process.argv[2] !== '') {
        console.log(`[SafeImport] started ${process.argv[2]}`);
        driver(process.argv[2]);
    }else{
        console.log("[SafeImport] started");
    driver();}
}


/**
 * 
 * @param {string} folderPath 
 * @returns {string[]}
 */
function constructJavascriptGlobInFolder(folderPath) {
    return [
        ["**/*.js", true],
        ["**/*.mjs", true],
        ["**/*.cjs", true],
        ["**/*.d.ts", false],
        ["**/*.ts", true],
        ["**/node_modules/**", false],
        ["**/dist/**", false],
        ["**/build/**", false],
        ["**/out/**", false],
        ["**/coverage/**", false],
        ["**/test/**", false],
        ["**/tests/**", false],
        ["**/__tests__/**", false],
        ["**/__mocks__/**", false],
    ].map(glob => {
        const prefix = glob[1] ? '' : '!';
        return prefix+path.resolve(folderPath, glob[0])});
}

