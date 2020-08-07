const {parentPort, workerData} = require("worker_threads")

/**
 * Future
 * @class
 */
module.exports = class Future {
    
    /**
     * @param {function} init 初始化函数
     * @param {function} poll 轮询函数
     * @constructor
     */
    constructor(init, poll) {
        this.data = workerData || {}
        this.init_handle = init.bind(this.data)
        this.poll_handle = poll.bind(this.data)
        this.init()
    }
    
    /**
     * 初始化
     * @returns {void}
     * @private
     */
    init() {
        const poll =  this.poll.bind(this)
        parentPort.on("message", poll) 
        this.init_handle()
    }
    
    /**
     * 发送消息到管道
     * @param {number} uid 任务ID
     * @param {Error} reject? 错误
     * @param {any} resolve? 返回数据
     * @returns {void}
     * @private
     */
    emit(uid, reject = {}, resolve) {
        parentPort.postMessage({
            reject: reject.message,
            ___uid: uid,
            resolve
        })
    }
    
    /**
     * 启动线程
     * @param {any} payload 负载
     * @returns {void}
     * @private
     */
    poll(payload) {
        const uid = payload.___uid
        this.poll_handle(payload)
            .then(x => this.emit(uid, undefined, x))
            .catch(x => this.emit(uid, x))
    }
}