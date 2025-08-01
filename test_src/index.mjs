import fs,{readFile} from 'node:fs'

// import classnames from 'classnames'
import * as s from 'esprima'
// import {sum, div} from './arithmetic.cjs';

console.log(s.parseScript("const a = 5;")); // $ExpectType boolean
// console.log(classnames({a:true,b:true})); // $ExpectType string
// console.log(sum(2, 3)); 
// console.log(neq('1.0.0', '1.0.1')); // $ExpectType boolean