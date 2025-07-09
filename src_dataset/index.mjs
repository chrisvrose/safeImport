import packages from 'download-counts' assert { type: 'json'}
import * as csv from 'csv'
import fsp from 'fs/promises'
const packageList = Object.keys(packages).map(e => [e, packages[e]]).filter(e=>e[1]>500000).sort((e,f)=>(f[1]-e[1]));
const packageMap = new Map(packageList)

console.log(packageMap.size)

const output = csv.stringify(packageList)
await fsp.writeFile('output.csv',output);