/*!
 * 运行时
 * runtime/index.js
 * Copyright (c) 2020 Mr.Panda.
 * 
 * 线程池运行时，
 * 创建和管理整个线程池.
 */

"use strict"

const format = require("./format.js")
const Pool = require("./pool.js")

/**
 * 创建线程池
 * @param {number} pools 启动线程数
 * @param {object} [task.mutex] 跨线程
 * @param {object} [task.data] 数据
 * @param {function} [task.initialize] 创建时调用
 * @param {fcuntion} [task.poll] 运行时调用
 * @returns {Pool}
 * @public
 */
exports.spawn = function(pools, task) {
    const source = format(task.initialize, task.poll)
    return new Pool(task, source, pools)
}