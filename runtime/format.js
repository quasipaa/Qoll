/*!
 * 格式化
 * runtime/format.js
 * Copyright (c) 2020 Mr.Panda.
 * 
 * 将关键函数转为字符串,
 * 组合成可以运行的单模块源代码.
 */

"use strict"

/**
 * 函数处理常量模板
 * @const
 */
const REPLACE_TEMPLATE = [
    [/async poll/, "async function"],
    [/async initialize/, "async function"],
    [/initialize/, "async function"],
    [/function/, "async function"],
    [/poll/, "async function"],
    [/\(/, "async ("]
]

/**
 * 规范写法
 * 通过将各种写法转为标准写法,
 * 使其可以作为函数参数传入Future类.
 * @param {string} source 源文本
 * @returns {string}
 * @private
 */
function replace(source) {
    for (const [match, target] of REPLACE_TEMPLATE)
        if (source.search(match) === 0)
            return source.replace(match, target)
    return source
}

/**
 * 模块引入
 * @returns {string}
 * @private
 */
function import_module() {
    const dirname = __dirname.replace(/\\/g, "/")
    return "const Future = require(\"" + dirname + "/future.js\")\r\n"
}

/**
 * 组合参数
 * @param {function} initialize 初始化函数
 * @param {function} poll 轮询函数
 * @returns {string}
 * @private
 */
function params(initialize, poll) {
    const poll_param = poll ? replace(poll.toString()) : "null"
    const initialize_param = initialize ? replace(initialize.toString()) : "null"
    return "new Future(" + initialize_param + ", " + poll_param + ")"
}

/**
 * 格式化
 * @param {function} initialize 初始化函数
 * @param {function} poll 轮询函数0
 * @returns {string}
 * @public
 */
module.exports = function(initialize, poll) {
    return import_module() + params(initialize, poll)
}
