"use strict"

/**
 * 跨线程锁
 * 工作线程
 * @class
 */
module.exports = class Worker {
    constructor() {
        this.listener = null
        this.callback = null
    }
    
    /**
     * 消息处理
     * @param {any} resolve 消息
     * @param {string} reject 错误
     * @returns {void}
     * @public
     */
    message({ reject, resolve }) {
        reject ? 
            this.callback.reject(new Error(reject)) : 
            this.callback.resolve(resolve)
    }
    
    /**
     * 绑定消息回调
     * @param {function} handle 句柄
     * @returns {void}
     * @public
     */
    bind(handle) {
        this.listener = handle
    }
    
    /**
     * 释放锁
     * @param {any} value 数据
     * @returns {promise<void>} 
     * @public
     */
    async unlock(value) {
        return new Promise((resolve, reject) => {
            this.callback = { resolve, reject }
            this.listener({ type: "unlock", value })
        })
    }
    
    /**
     * 获取锁
     * @returns {promise<any>}
     * @public
     */
    lock() {
        return new Promise((resolve, reject) => {
            this.callback = { resolve, reject }
            this.listener({ type: "lock" })
        })
    }
}