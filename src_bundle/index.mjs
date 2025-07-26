import wp from 'webpack';
import path from 'node:path'
const outputPath = path.resolve('./output/');
console.log(outputPath);

const ls = [
'classnames',
'semver',
'ansi-styles',
'debug',
'supports-color',
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
]

ls.forEach(l=>{
    
    const libraryLocation = import.meta.resolve(l);
    console.log(libraryLocation);
    // throw Error("5");
    wp({
        entry:libraryLocation,
        mode: 'production',
        optimization:{
            mangleExports: false,
            avoidEntryIife: true,
            minimize: false
            
        },
        output: {
            path: outputPath,
            filename: l+'.bundle.cjs',
            clean: false,
            iife: false,
            library: {
                type: 'commonjs2',
                // name: l
            }
            // module: true
        }
        ,
    },(err,stats)=>{
        if (err || stats.hasErrors()) {
            console.log(err?.stack)
            console.log(stats?.hasErrors())
            console.log(stats?.toJson());
        }
    })


})
