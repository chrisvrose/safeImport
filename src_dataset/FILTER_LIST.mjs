import GlobToRegExp from "glob-to-regexp";

const FILTER_LIST = [
    "https://github.com/substack/*",
    "https://gitlab.com/contexttesting/zoroaster.git",
    "https://github.com/Eternity-Bots",
    "https://github.com/node-x-extras/x-path",
    "https://github.com/zkochan/packages/blob/main/which-pm-runs",
    "https://github.com/webpack-contrib/webpack-addons",
    "https://github.com/zznoillusion1026/MyImage",
    "https://codehub.devcloud.huaweicloud.com/jsztxm00001/zzb-vue-ui.git",
    "https://github.com/DZSF",
    "https://github.com/chuzhixin/zx-count",
    "https://github.com/nodelib/nodelib/tree/master/packages/fs/fs.stat",
    "https://github.com/nodelib/nodelib/tree/master/packages/fs/fs.scandir",
    "https://github.com/nodelib/nodelib/tree/master/packages/fs/fs.walk",
    "https://github.com/nodelib/nodelib/tree/master/packages/fs/fs.macchiato",
    "https://github.com/paulmillr/async-each",
    "https://github.com/yarnpkg/yarn/blob/master/packages",
    "https://github.com/emotion-js/emotion/tree/master/packages/stylis",
    "https://github.com/kogosoftwarellc/open-api/tree/master/packages/openapi-types",
    "https://github.com/thenativeweb/boolean",
    "https://github.com/zkochan/packages/tree/master/read-yaml-file",
    "https://github.com/johnotander/rgba-regex",
    "https://github.com/adobe/react-spectrum/tree/main/packages/@internationalized/date",
    "https://github.com/pnpm/pnpm/blob/main/packages",
    "https://github.com/jhermsmeier/node-scuid",
    "https://github.com/emotion-js/emotion/tree/master/packages/babel-plugin-emotion",
    "https://github.com/emotion-js/emotion/tree/master/removed-packages/core",
    "https://github.com/babel/babel/tree/master/packages/*",
    "https://github.com/pugjs/pug/tree/master/packages/*",
    "https://github.com/zkochan/packages/tree/master/*",
    "https://github.com/Marak/Faker.js",
    "https://github.com/ethanent/phin",
    "https://github.com/Popmotion/popmotion/tree/master/packages/*",
    "https://github.com/gulpjs/copy-prop"
];

const FILTER_LIST_REGEX = FILTER_LIST.map(GlobToRegExp)

/**
 * 
 * @param {string} repoUrl 
 * @returns 
 */
export function matchFilterList(repoUrl) {
    return FILTER_LIST_REGEX.some(filter => filter.test(repoUrl));
}
