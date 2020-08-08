import format from "./format"
import Pool from "./pool"

/**
 * 任务
 * @param {function} [poll] 轮询函数
 * @param {function} [init] 初始化函数
 * @param {any} [data] 数据 
 */
export interface Task<D, P, U> {
    poll: (param: P) => U
    init: () => void
    data: D
}

/**
 * 配置
 * @param {number} [workers?] 启动线程数
 */
export interface Option {
    workers?: number
}

/**
 * 创建线程池
 * @param {object} [task.data] 数据存储
 * @param {function} [task.init] 创建时调用
 * @param {fcuntion} [task.poll] 运行时调用
 * @param {number} [option.workers?] 启动线程数
 * @returns {Pool}
 * @public
 */
export function spawn<D, P, U>(task: Task<D, P, U>, option?: Option): Pool<D, P, U> {
    return new Pool(task.data, format(task.init, task.poll), option || {})
}
