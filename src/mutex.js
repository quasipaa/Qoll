const Channel = require("./channel.js")

/**
 * 状态监听
 * @param {function} callback 回调
 * @returns {Proxy}
 * @private
 */
function State(callback) {
    return new Proxy({ lock: false }, {
        get: (target) => target.lock,
        set: (target, _, value) => {
            target.lock = value
            callback(value)
        }
    })
}

/**
 * 跨线程锁
 * 跨线程锁包装器
 * @param {any} value 数据
 * @returns {object}
 * @public
 */
exports.Mutex = function(value) {
    return { value, ___mutex: true }
}

/**
 * 跨线程锁核心
 * @class
 */
exports.MutexCore = class MutexCore {
    
    /**
     * @param {any} payload 负载
     * @constructor
     */
    constructor(payload) {
        this.payload = payload
        this.state = State(this.watch.bind(this))
    }
    
    /**
     * 锁更新
     * @param {boolean} state 状态
     * @returns {void}
     * @private
     */
    watch(state) {
        
    }
    
    /**
     * 请求锁
     * @public
     */
    lock() {
        
        /**
         * 数据没有加锁
         * 立即抢占锁
         */
        if (!this.state.lock) {
            this.state.lock = true
        }
    }
}

/**
 * 跨线程锁
 * 工作线程
 * @class
 */
exports.MutexWorker = class MutexWorker extends Channel {
    
    /**
     * @constructor
     */
    constructor() {
        super()
    }
    
    /**
     * 释放锁
     * @param {any} value 数据
     * @returns {promise<void>} 
     * @public
     */
    async unlock(value) {
        
    }
    
    /**
     * 获取锁
     * @returns {promise<any>}
     * @public
     */
    async lock() {
        
    }
}