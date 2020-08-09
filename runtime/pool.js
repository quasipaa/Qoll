/*!
 * 线程池
 * runtime/pool.js
 * Copyright (c) 2020 Mr.Panda.
 * 
 * 管理线程池的调度,
 * 以及与每个子线程之间的通信.
 */

"use strict"

const { Worker } = require("worker_threads")
const MutexMaster = require("../mutex/master")
const Channel = require("../channel.js")
const { cpus } = require("os")

/**
 * 线程池
 * @class
 */
module.exports = class Pool {

    /**
     * @param {object} mutex? 跨线程
     * @param {object} data? 数据
     * @param {string} context 句柄字符串
     * @param {number} [option.workers?] 启动线程数
     * @constructor
     */
    constructor(mutex, data, context, option) {
        this.index = 0
        this.pool = []
        this.queue = {}
        this.option = option
        this.size = option.workers || cpus().length
        this.mutex = new MutexMaster(mutex || {})
        this.initialize(data || {}, context)
    }

    /**
     * 初始化
     * @param {object} workerData 数据
     * @param {string} context 句柄字符串
     * @returns {void}
     * @private
     */
    initialize(workerData, context) {
        this.initialize_pool(workerData, context)
        this.pool.forEach(this.bind_message.bind(this))
        this.mutex.callback(this.bind_mutex.bind(this))
    }
  
    /**
     * 初始化线程池
     * @param {object} workerData 数据
     * @param {string} context 句柄字符串
     * @returns {void}
     * @private
     */
    initialize_pool(workerData, context) {
        this.pool = new Array(this.size).fill(null)
            .map(() => new Worker(context, { workerData, eval: true }))
            .map((worker, index) => ({ index, worker, done: true }))
            .map(x => ({ ...x, worker: new Channel(x.worker) }))
    }
    
    /**
     * 绑定跨线程锁消息
     * @param {number} index 索引
     * @param {any} value 消息
     * @returns {void}
     * @private
     */
    bind_mutex(index, value) {
        const { worker } = this.pool[index]
        worker.emit("___mutex", value)
    }
    
    /**
     * 绑定线程消息
     * @param {Worker} [worker] 线程
     * @param {number} i 索引
     * @returns {void}
     * @private
     */
    bind_message({ worker }, i) {
        worker.on("___rpc", v => this.watch(i, v))
        worker.on("___mutex", v => this.mutex.message(v, i))
    }
    
    /**
     * 获取所有已释放的线程
     * @returns {Array<Worker>}
     * @private
     */
    frees() {
        return this.pool.filter(x => x.done)
    }
    
    /**
     * 获取任务列表
     * @returns {Array<string>}
     * @private
     */
    keys(size) {
        return Object.keys(this.queue)
            .filter(x => !this.queue[x].alloc)
            .slice(0, size)
    }
    
    /**
     * 分配任务
     * @param {Worker} [worker] 线程
     * @param {number} [index] 索引
     * @param {string} uid
     * @returns {void}
     * @private
     */
    alloc({ worker, index }, uid) {
        const { payload } = this.queue[uid]
        worker.emit("___rpc", { payload, uid })
        this.pool[index].done = false
        this.queue[uid].alloc = true
    }

    /**
     * 队列更新
     * @returns {void}
     * @private
     */
    async update() {
        await undefined
        const free = this.frees()
        if (free.length === 0) return undefined
        const keys = this.keys(free.length)
        keys.forEach((uid, i) => this.alloc(free[i], uid))
    }

    /**
     * uid
     * @returns {string}
     * @private
     */
    uid() {
        const target = this.index + 1
        this.index = target == Number.MAX_VALUE ? 0 : target
        return String(this.index)
    }

    /**
     * 响应监听
     * @param {number} index 索引
     * @param {any} result 响应
     * @returns {void}
     * @private
     */
    watch(index, result) {
        this.pool[index].done = true
        const is_error = typeof result.reject === "string"
        const { reject, resolve } = this.queue[result.uid]
        is_error ? reject(new Error(result.reject)) : resolve(result.resolve)
        delete this.queue[result.uid]
        this.update()
    }
    
    /**
     * 创建任务
     * @param {any} payload 负载
     * @param {function} resolve 成功
     * @param {function} reject 错误
     * @returns {void}
     * @private
     */
    task(payload, resolve, reject, alloc = false, uid = this.uid()) {
        this.queue[uid] = { payload, resolve, reject, alloc }
        this.update()
    }

    /**
     * 唤醒线程
     * @param {any} payload 负载
     * @returns {Promose<any>} 
     * @public
     */
    wake(payload) {
        return new Promise((resolve, reject) => {
            this.task(payload, resolve, reject)
        })
    }
}
