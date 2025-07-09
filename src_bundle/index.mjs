import wp from 'webpack';
import path from 'node:path'
const outputPath = path.resolve('./output/');
console.log(outputPath);
const compiler = wp({
    entry:'./test_src/arithmetic.cjs',
    mode: 'production',
    optimization:{
        mangleExports: false,
        avoidEntryIife: true,
        minimize: false
    },
    output: {
        path: outputPath,
        filename: 'lodash.bundle.js',
        scriptType: 'module',
        
    }
    ,
},(err,stats)=>{
    if (err || stats.hasErrors()) {
        console.log(stats.hasErrors())
        console.log(err?.stack)
        console.log(stats.toJson());
    }
})
