module.exports.sum = function sum(a, b) {
    return a + b;
}
module.exports.div = function div(a, b) {
    if (b == 0) return NaN;
    return a / b;
}