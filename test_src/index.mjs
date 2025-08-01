import fs,{readFile} from 'node:fs'

import classnames from 'classnames'
// import {neq} from 'semver'
import {sum, div,sad} from './arithmetic.cjs';

readFile('a',(err)=>{
    if(err){return;}
})
console.log(classnames('a', 'b', 'c',{a:5})); // $ExpectType string
console.log(sum(2, 3)); 
// console.log(neq('1.0.0', '1.0.1')); // $ExpectType boolean