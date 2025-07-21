import wp from 'webpack';
import path from 'node:path'
const outputPath = path.resolve('./output/');
console.log(outputPath);

const l = 'classnames'
const libraryLocation = import.meta.resolve(l);
console.log(libraryLocation);


// throw Error("5");
const compiler = wp({
    entry:libraryLocation,
    mode: 'production',
    optimization:{
        mangleExports: false,
        avoidEntryIife: true,
        minimize: false
        
    },
    // experiments:{}
    output: {
        path: outputPath,
        filename: l+'.bundle.cjs',
        clean: true,
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
