var {existsSync,readFile} = require('node:fs');
// const {cwd} = require('process');
var _var = require('process');
var {sum, div} = require('./arithmetic.cjs');
var {sum, div} = require('../output/lodash.bundle.js');
var {ceil} = require('./lodash.js')
let cwd = process.cwd;
console.log('a')

function x(){
    return {x:3};
}

// readFile('./package.json',(data)=>{
    
// });
let newLocal = existsSync("./package.json");

console.log(`Read some data`,newLocal,sum(2,34));
console.log(`Read some data`,newLocal,
    div(7,0),
    div(32,3),
    ceil(10.24)
);