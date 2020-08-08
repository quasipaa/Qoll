const { parentPort, workerData } = require("worker_threads")
const Channel = require("./channel.js")

/**
 * Future
 * @class
 */
module.exports = class Future extends Channel {

    /**
     * @param {function} initialize 初始化函数
     * @param {function} poll 轮询函数
     * @constructor
     */
    constructor(initialize, poll) {
        super(parentPort)
        this.data = workerData || {} 
        this.handle = poll.bind(this.data)
        this.on("___rpc", this.poll.bind(this))
        initialize.bind(this.data)()
    }

    /**
     * 发送消息到管道
     * @param {string} uid 任务ID
     * @param {Error} reject? 错误
     * @param {any} resolve? 返回数据
     * @returns {void}
     * @private
     */
    send(uid, reject = {}, resolve) {
        this.emit("___rpc", {
            reject: reject.message,
            resolve,
            uid
        })
    }

    /**
     * 启动线程
     * @param {any} payload 负载
     * @returns {void}
     * @private
     */
    poll({ payload, uid }) {
        this.handle(payload)
            .then(x => this.send(uid, undefined, x))
            .catch(x => this.send(uid, x))
    }
}
