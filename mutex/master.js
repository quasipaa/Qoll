/*!
 * 跨线程锁（主线程）
 * mutex/master.js
 * Copyright (c) 2020 Mr.Panda.
 * 
 * 管理锁动作的调度,
 * 以及有锁数据的原子操作.
 */

"use strict"

/**
 * 跨线程锁核心
 * @class
 */
module.exports = class Core {
    
    /**
     * @param {any} payload 负载
     * @constructor
     */
    constructor(payload) {
        this.queue = []
        this.handle = null
        this.state = false
        this.payload = payload
    }
    
    /**
     * 绑定回调
     * @param {function} handle 回调
     * @returns {void}
     * @private
     */
    callback(handle) {
        this.handle = handle
    }
    
    /**
     * 消息事件
     * @param {string} [type] 类型
     * @param {any} [value] 数据
     * @param {number} index 索引
     * @returns {void}
     * @private
     */
    message({ type, value }, index) {
        type === "lock" && this.push(index)
        type === "unlock" && this.unlock(index, value)
    }
    
    /**
     * 推送队列
     * @param {number} index 索引
     * @returns {void}
     * @private
     */
    push(index) {
        this.queue.unshift(index)
        this.change()
    }
    
    /**
     * 获取锁
     * @param {number} index 索引
     * @returns {promise<any>}
     * @private
     */
    lock(index) {
        const resolve = this.payload
        this.handle(index, { resolve })
        this.state = true
    }
    
    /**
     * 释放锁
     * @param {number} index 索引
     * @param {any} value 数据
     * @returns {promise<any>}
     * @private
     */
    unlock(index, value) {
        this.payload = value
        this.handle(index, { resolve: true })
        this.state = false
        this.change()
    }
    
    /**
     * 状态变更
     * @returns {promise<void>}
     * @private
     */
    async change() {
        await undefined
        if (this.state) return undefined
        if (this.queue.length === 0) return undefined
        this.lock(this.queue.pop())
    }
}