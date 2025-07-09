const { readFileSync } = require('fs');

module.exports.x = function x() {
    return readFileSync("path.json").toString();
}
