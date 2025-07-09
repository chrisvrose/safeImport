var fs = require('node:fs');
var process = require('process');

console.log('a')

function x(){
    return {x:3};
}

var newLocal = fs.existsSync("./package.json");
console.log(`Read some data`,newLocal);