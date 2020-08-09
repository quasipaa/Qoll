/*!
 * 子线程包装
 * runtime/future.js
 * Copyright (c) 2020 Mr.Panda.
 * 
 * 子线程循环运行时,
 * 管理子线程的任务执行和与主线程之间的通信.
 */

"use strict"

const { parentPort, workerData = {} } = require("worker_threads")
const MutexWorker = require("../mutex/worker.js")
const Channel = require("../channel.js")
const mutex = new MutexWorker()

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
        this.mutex = mutex
        this.data = { ...workerData, mutex }
        this.poll_handle = poll.bind(this.data)
        this.initialize_handle = initialize.bind(this.data)
        this.initialize()
    }
    
    /**
     * 初始化
     * @returns {void}
     * @private
     */
    initialize() {
        this.on("___rpc", this.poll.bind(this))
        this.on("___mutex", v => this.mutex.message(v))
        this.mutex.callback(v => this.emit("___mutex", v))
        this.initialize_handle()
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
        this.poll_handle(payload)
            .then(x => this.send(uid, undefined, x))
            .catch(x => this.send(uid, x))
    }
}
