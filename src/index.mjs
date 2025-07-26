
import assert from 'node:assert';
import { getASTAndScope } from './ast/analysis.mjs';

import { getRequireCallsAndConstantArgs } from './calls.mjs';
import { readFileSync ,realpathSync ,mkdirSync} from 'node:fs';
import { writeFile } from 'node:fs/promises';
import tsc, { Project, SyntaxKind } from 'ts-morph';
import {getSliceAndInfoSync} from 'slice-js/src/slice-code/test/helpers/utils.js';
import path, { dirname,join } from 'node:path';
// import tsc from 'typescript'
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

class ImportCall{
    /**
     * @type {'import'|'importExpr'|'require'}
     */
    importType;
    /**
     * @type {string}
     */
    importSyntax;
    /**
     * 
     * @param {'import'|'importExpr'|'require'} importType 
     * @param {string} importSyntax 
     */
    constructor(importType, importSyntax){
        this.importSyntax = importSyntax;
        this.importType = importType;
    }
}

function main2() {
    const FILE_PATH = './test_src/index.cjs';

    const project = new Project({compilerOptions:{allowJs: true, checkJs: false,}});
    project.addSourceFileAtPathIfExists(FILE_PATH);

    // const project = tsc.createProgram([FILE_PATH],);
    const checker = project.getTypeChecker();

    const sourceFile = project.getSourceFile(FILE_PATH)
    
    const importDecls = sourceFile.getImportStringLiterals()
    for(const importStringDecl of importDecls){
        console.log(importStringDecl);
        const importDecl = importStringDecl.getFirstAncestor();
        if(importDecl.isKind(SyntaxKind.CallExpression)){
            // the declaration is callExpression. Verify its based an identifier aliasing import or require
            const importExpr = importDecl.getExpression();
            const type = checker.getTypeAtLocation(importExpr);
            console.log("Type of import expression",checker.compilerObject.resolveName());
            console.log(importExpr);
            if(importExpr.isKind(SyntaxKind.Identifier)){
                // import is a require or import
                const importName = importExpr.getText();
                if(importName==='require' || importName==='import'){
                    console.log("Found require/import call",importExpr);
                }
            }
            
        
        }else if(importDecl.isKind(SyntaxKind.ImportDeclaration)){
            // TODO pending extract the calls.
        }else{
            console.error("Unexpected import specifier",SyntaxKind[importDecl]);
        }
        const importThing = importStringDecl.getParent()
    }
    
    console.log(importDecls);
}

if (process.argv[1] === import.meta.filename) {
    console.log("[SafeImport] started");
    main2();
    console.log("done");
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
