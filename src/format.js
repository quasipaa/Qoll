"use strict"

/**
 * 规范写法
 * @param {string} source 源文本
 * @returns {string}
 * @private
 */
function replace(source) {
    if (source.search(/function/) === 0) return source.replace(/function/, "async function")
    if (source.search(/async poll/) === 0) return source.replace(/async poll/, "async function")
    if (source.search(/async init/) === 0) return source.replace(/async init/, "async function")
    if (source.search(/poll/) === 0) return source.replace(/poll/, "async function")
    if (source.search(/init/) === 0) return source.replace(/init/, "async function")
    if (source.search(/\(/) === 0) return source.replace(/\(/, "async (")
    return source
}

/**
 * 格式化
 * @param {function} init 初始化函数
 * @param {function} poll 轮询函数
 * @returns {string}
 * @public
 */
module.exports = function(init, poll) {
    return [
        "const Future = require(\"",
        __dirname.replace(/\\/g, "/"),
        "/future.js\");", "new Future(",
        init ? replace(init.toString()) : "null", ",",
        poll ? replace(poll.toString()) : "null", ")"
    ].join("")
}