import wp from 'webpack';
import path from 'node:path'


if (process.argv[1] === import.meta.filename) {
    console.log("[SafePack] started");
    main();
    console.log("done");
}

function main() {
    const ls = [
        'classnames',
        'semver',
        'ansi-styles',
        // 'debug',
        // 'supports-color',
        'chalk',
        'ms',
        'minimatch',
        'strip-ansi',
        'tslib',
        'has-flag',
        'ansi-regex',
        'color-convert',
        'color-name',
        // 'type-fest',
        'string-width'
    ];

    ls.forEach(l => {

        wpCompress(l).then(outputFileLocation => {
            console.log("[wp] success", outputFileLocation);
        }).catch(err => {
            console.error("[failed wp]", l);
            console.error("[wp] error");

        });


    });
}

export function wpCompress(l, outputPath = path.resolve('./output/')) {
    return new Promise((resolve, reject) => {
    const libraryLocation = import.meta.resolve(l);
    console.log(libraryLocation);
    const outputFile = l + '.bundle.cjs';
    // throw Error("5");
    wp({
        entry: libraryLocation,
        mode: 'production',
        optimization: {
            mangleExports: false,
            avoidEntryIife: true,
            minimize: false,
            
        },
        resolve:{
            fallback:{
                 "path": false 
            }
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

