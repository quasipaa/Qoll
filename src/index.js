const format = require("./format.js")
const Pool = require("./pool.js")

/**
 * 创建线程池
 * @param {object} [task.data] 数据存储
 * @param {function} [task.init] 创建时调用
 * @param {fcuntion} [task.poll] 运行时调用
 * @param {number} [option.workers?] 启动线程数
 * @returns {Pool}
 * @public
 */
exports.spawn = function(task, option = {}) {
    const source = format(task.init, task.poll)
    return new Pool(task.data, source, option)
}