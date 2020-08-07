const {Worker} = require("worker_threads")
const cpus = require("os").cpus().length
const {EventEmitter} = require("events")

/**
 * 线程池
 * @class
 */
module.exports = class Pool extends EventEmitter {
    
    /**
     * @param {object} data? 数据
     * @param {string} context 句柄字符串
     * @param {number} [option.workers?] 启动线程数
     * @constructor
     */
    constructor(data, context, option) {
        super()
        this.index = 0
        this.pool = []
        this.queue = {}
        this.option = option
        this.size = option.workers || cpus
        this.init(data || {}, context)
    }
    
    /**
     * 初始化
     * @param {object} workerData 数据
     * @param {string} context 句柄字符串
     * @returns {void}
     * @private
     */
    init(workerData, context) {
        this.on("__change", this.update.bind(this))
        this.pool = new Array(this.size).fill(null)
            .map(() => new Worker(context, {workerData, eval: true}))
            .map((worker, index) => ({index, worker, done: true}))
        this.pool.forEach(({worker}, i) => {
            worker.on("message", v => {
                this.watch(i, v)
            })
        })
    }
    
    /**
     * 队列更新
     * @returns {void}
     * @private
     */
    update() {
        const free = this.pool.filter(x => x.done)
        if (free.length === 0) return undefined
        const keys = Object
            .keys(this.queue)
            .filter(x => !this.queue[x].alloc)
            .slice(0, free.length)
        keys.forEach((___uid, i) => {
            const {worker, index} = free[i]
            const {payload} = this.queue[___uid]
            worker.postMessage({...payload, ___uid})
            this.queue[___uid].alloc = true
            this.pool[index].done = false
        })
    }
    
    /**
     * 响应监听
     * @param {number} index 索引
     * @param {any} response 响应
     * @returns {void}
     * @private
     */
    watch(index, response) {
        this.pool[index].done = true
        const {reject, resolve} = this.queue[response.___uid]
        response.reject && reject(new Error(response.reject))
        response.resolve && resolve(response.resolve)
        delete this.queue[response.___uid]
        this.emit("__change")
    }
    
    /**
     * uid
     * @returns {string}
     * @private
     */
    uid() {
        const max = Number.MAX_VALUE
        const target = this.index + 1
        this.index = target == max ? 0 : target
        return String(this.index)
    }
    
    /**
     * 唤醒线程
     * @param {any} payload 负载
     * @returns {Promose<any>} 
     * @public
     */
    wake(payload) {
        const uid = this.uid()
        return new Promise((resolve, reject) => {
            this.queue[uid] = {payload, resolve, reject, alloc: false}
            this.emit("__change")
        })
    }
}