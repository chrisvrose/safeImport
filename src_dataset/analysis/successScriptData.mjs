

// iterate through success.txt, and gather tree stats and cloc stats

import { readFile ,writeFile} from "fs/promises";
import {promisify} from 'node:util'
import { exec } from 'node:child_process';
import { processPromisesBatch } from "../batch.mjs";
import { cacheFunctionOutput } from "../cache.mjs";
import {stringify} from 'csv/sync'
const execP = promisify(exec);


const text = (await readFile('success.txt')).toString();

const repos = text.trim().split('\n');

const repoCountsCached = await cacheFunctionOutput('repoClocCounts.json',async ()=>{
    const repoCounts = await processPromisesBatch(repos,32,getCloc);
    return repoCounts;
},true);
console.log(repoCountsCached.filter(e=>e.before.nFiles!==null).length)

/** @typedef {typeof repoCountsCached[0]} RepoCount */
/** @type {Map<string,RepoCount} */
const x = new Map();

for(const repoCount of repoCountsCached){
    x.set(repoCount.repoName,repoCount);
}

// console.log(x)
const expected_order = [
"mime-types",
"http-errors",
"source-map-support",
"compressible",
"global-modules",
"thenify",
"mz",
"memory-fs",
"pinkie-promise",
"pretty-error",
"renderkid",
"hpack.js",
"wbuf",
"expand-tilde",
"homedir-polyfill",
"basic-auth",
"for-own",
"is-unc-path",
"recursive-readdir",
"path-root",
"cookies",
"bufferutil",
"utf-8-validate",
"easy-table",
"is-dotfile",
"glob-parent",
"is-glob",
"doctrine",
"define-property",
"jsonfile",
"optionator",
"type-check",
"levn",
"is-extendable",
"esquery",
"on-finished",
"error-ex",
"finalhandler",
"content-disposition",
"terser",
"proxy-addr",
"prop-types",
"has-values",
"has-value",
"url-parse",
"simple-swizzle",
"clone-deep",
"shallow-clone",
"prettier-linter-helpers",
"cors",
"fd-slicer",
"object.pick",
"language-tags",
"union-value",
"object-copy",
"static-extend",
"hash.js",
"browserify-zlib",
"hmac-drbg",
"des.js",
"dom-converter",
"zip-stream",
"crc32-stream",
"one-time",
"resolve-dir",
"yargs-unparser",
"warning",
"bplist-parser",
"md5",
"is-relative",
"is-absolute",
"redis-parser",
"lazy-cache",
"css-to-react-native",
"parse-filepath",
"request-progress",
"jest-junit",
"postcss-initial",
"unixify",
"cookie-parser",
"saslprep",
"window-size",
"keygrip",
"contains-path",
"fined",
"object.defaults",
"is-color-stop",
"gonzales-pe",
"make-iterator",
"glob-base",
"uid-safe",
"fancy-log",
"object.map",
"object.omit",
"find-babel-config",
"mquery",
"xlsx",
"json-to-pretty-yaml",
"named-placeholders",
"parse-glob",
"plugin-error",
"is-equal-shallow",
"original",
"detective-typescript",
"detective-es6",
"json2mq",
"create-error-class",
"detective-cjs",
"to-through",
"resolve-options",
"ansi-gray",
"bcrypt",
"mixin-object",
"optimize-css-assets-webpack-plugin",
"ordered-read-streams",
"sync-fetch",
"to-absolute-glob",
"glogg",
"unique-stream",
"align-text",
"gulplog",
"blob",
"center-align",
"right-align",
"wkx",
"chai-as-promised",
"json-pointer",
"has-glob",
"promptly",
"hot-shots",
"semver-greatest-satisfied-range",
"each-props",
"is2",
"levenary",
"airbnb-prop-types",
"remove-bom-stream",
"remove-bom-buffer",
"dotenv-defaults",
"rework",
"vizion",
"array-sort",
"default-compare",
"pad-right",
"passport-local",
"console.table",
"cli-tableau",
"condense-newlines",
"requireg",
"object.reduce",
"properties-reader",
"array-initial",
"default-resolution",
"collection-map",
"ansi-red",
"broccoli-merge-trees",
"eslint-plugin-react-native",
"is-valid-path",
"strip-hex-prefix",
"uglify-es",
"ansi-cyan",
"method-override",
"readline2",
"number-allocator",
"has-gulplog",
"ethjs-util",
"unescape",
"validate.io-integer",
"stream-parser",
"compute-gcd",
"validate.io-integer-array",
"compute-lcm",
"set-getter",
"passport-oauth2",
"i18n-iso-countries",
"sha1",
"json-diff",
"dreamopt",
"highlight-es",
"basic-auth-connect",
"glob2base",
"third-party-capital",
"new-date",
"webrtc-adapter",
"xhr-request-promise",
"contentful-resolve-response",
"jest-sonar-reporter",
"parse-author",
"amd-name-resolver",
"mocha-multi-reporters",
"eslint-plugin-filenames",
"apache-crypt",
"semver-intersect",
"fetch-ponyfill",
"karma-mocha",
"is-odd",
"babel-plugin-ember-modules-api-polyfill",
"csurf",
"taketalk",
"require-and-forget",
"geojson-equality",
"relative",
"pkg-config",
"rss-parser",
"xml-but-prettier",
"karma-spec-reporter",
"speakeasy",
"parsejson",
]
const vals = expected_order.map((e)=>{
    const v = x.get(e);
    return [e,v?.before?.nFiles,v?.after?.nFiles,v?.before?.code,v?.after?.code,v?.sizeReduction]
})
const valsString = stringify(vals,{header:true,columns:['repo','nFilesBefore','nFilesAfter','codeBefore','codeAfter','sizeReduction']})
// console.log(valsString)
await writeFile('success_cloc_stats.csv',valsString)

/**
 * Run cloc --json on the repo, and return the json parsed.
 * @param {string} repo 
 */
async function getCloc(repo){
    const e1Promise = execP(`cloc --json output/${repo} | jq "{nFiles:.JavaScript.nFiles,code:.JavaScript.code}"`)
    const e2Promise = execP(`cloc --json dist/${repo} | jq "{nFiles:.JavaScript.nFiles,code:.JavaScript.code}"`)
    const [{stdout},{ stdout:stdPost }] = await Promise.all([e1Promise,e2Promise]);
    // console.log("haha",repo)
    /** @typedef {{nFiles:number|null,code:number|null}} CodeInfo */
    /** @type {CodeInfo} */
    const stdOutObj = JSON.parse(stdout);
    /** @type {CodeInfo} */
    const stdPostObj = JSON.parse(stdPost);
    // assertFilesContained(stdOutObj, repo);
    // assertFilesContained(stdPostObj, repo);
    // if(repo==='mime-types'){
    //     console.log('AAAA',stdPostObj.code,stdOutObj.code)
    // }
    return {repoName: repo,before:stdOutObj,after:stdPostObj,sizeReduction:stdPostObj.code/stdOutObj.code};

}

function assertFilesContained(stdOutObj, repo) {
    if (stdOutObj.nFiles === 0 || stdOutObj?.nFiles === undefined || stdOutObj?.nFiles === null) {
        console.error(stdOutObj);
        throw new Error(`cloc pre failed for ${repo} - no files counted`);
    }
    if(stdOutObj?.code ===undefined || stdOutObj?.code === null){
        console.error(stdOutObj);
        throw new Error(`cloc pre failed for ${repo} - no code field`);
    }
}
