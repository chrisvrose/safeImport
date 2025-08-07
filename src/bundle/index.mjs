import wp from 'webpack';
import path from 'node:path'
import {createRequire,builtinModules} from 'node:module'

/**
 * 
 * @param {string} l library name
 * @param {string} moduleLocation module location
 * @param {string} outputPath 
 * @returns 
 */
export function wpCompress(l, moduleLocation,outputPath = path.resolve('./output/')) {
    return new Promise((resolve, reject) => {

    const libraryLocation = extractFunctionForModule(l, moduleLocation);
    console.log(libraryLocation);
    const outputFile = l + '.bundle.cjs';
    console.log(`[WebPack] Compressing ${l} in ${moduleLocation} to ${outputFile}`);
    const moduleFallbackMap = builtinModules.reduce((prev, current) => {
        prev[current] = false;
        return prev;
    }, {});
    wp({
        entry: libraryLocation,
        mode: 'production',
        optimization: {
            mangleExports: false,
            avoidEntryIife: true,
            minimize: false,
            moduleIds: 'named',
            concatenateModules: true,

        },
        resolve:{
            modules: [path.join(moduleLocation,'./node_modules')],
            fallback:moduleFallbackMap
        },
        output: {
            path: outputPath,
            filename: outputFile,
            clean: false,
            iife: false,
            library: {
                type: 'commonjs2',
                // name: l
            }
            // module: true
        },
    }, (err, stats) => {
        if (err || stats.hasErrors()) {
            console.error(`[WebPack] Error Stack`,err?.stack);
            console.log(`[WebPack]`,stats?.toJson().errors);
            reject(err || stats);
        }else{
            resolve(path.resolve(outputPath, outputFile));
        }
    });
});
}
function extractFunctionForModule(l, moduleLocation) {
    const moduleLocationPath = path.resolve(moduleLocation,'package.json');
    const require = createRequire(moduleLocationPath);
    const resolved = require.resolve(l)
    return resolved;
}

