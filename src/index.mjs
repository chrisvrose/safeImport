
import assert from 'node:assert';
import { getASTAndScope } from './ast/analysis.mjs';

import { getRequireCallsAndConstantArgs } from './calls.mjs';
import { analyze, instrumentString, instrumentDir } from 'jalangi2';
import { readFileSync ,realpathSync} from 'node:fs';

import {getSliceAndInfoSync} from 'slice-js/dist/slice-code/test/helpers/utils.js';
import { dirname,join } from 'node:path';
/**
 * Call parameter generation
 */
function main() {
    const FILE_PATH = './test_src/index.cjs';
    const { scopeManager, _parsedModAST } = getASTAndScope(FILE_PATH);
    assert(scopeManager.scopes.length >= 2, "expected atleast global and module scope");
    assert(scopeManager.scopes[1].type === 'function', "expected the 'module' scope to have function scope");

    const calls = getRequireCallsAndConstantArgs(scopeManager);

    for (const [moduleName, callBoxes] of calls.entries()) {
        if (moduleName.startsWith('.')) {
            console.log('Importing', moduleName, callBoxes);
        } else {
            console.log(`Module "${moduleName}" - System module. FIXME skipping`);
        }
    }
    console.log(`Call List`, calls);

    for (const [moduleName, callBox] of calls) {
        // console.log(callBox);
        if (!moduleName.startsWith('.')) {
            continue;
        }

        const relatedModuleNamePath = join(realpathSync(dirname(FILE_PATH)) ,moduleName);
        const fileSource = readFileSync(relatedModuleNamePath).toString('utf-8');
        const {slicedCode} = getSliceAndInfoSync(fileSource, (moduleExports) => {
            return [...callBox.entries()].flatMap(([methodName, methodArgsList])=>{
                const methodNameNormed = methodName.substring(1);
                console.log("Calls for ",methodNameNormed,methodArgsList)
                return methodArgsList.map(methodArgsList=>moduleExports[methodNameNormed].apply(moduleExports[methodNameNormed],methodArgsList));
            })
        },relatedModuleNamePath);
        console.log(`Sliced code ${moduleName}\n`,slicedCode);
    }
}

function jalangiInstrumentMain() {
    const FILE_PATH = './test_src/index.cjs';


    const fileString = readFileSync(FILE_PATH).toString();
    const y = instrumentString(fileString, {});
    console.log(y);
}


/**
 * Analysis POC
 */
function jalangiAnalyzeMain() {
    const FILE_PATH = './test_src/index.cjs';

    const y = analyze(FILE_PATH, ["./node_modules/jalangi2/src/js/sample_analyses/tutorial/LogAll.js", "./src_analysis/analysisCallbackTemplate.cjs"]);
    // const x = 5;
    y.then(yp => {
        console.log("Analysis complete", yp);
    }).catch(console.error).finally(kek => {
        console.log("Threw error", kek);
    })
}

if (process.argv[1] === import.meta.filename) {
    console.log("[SafeImport] started")
    main();
}


