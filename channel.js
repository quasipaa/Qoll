const { EventEmitter } = require("events")

/**
 * 管道类
 * @class
 */
module.exports = class Channel extends EventEmitter {
    
    /**
     * @param {MessagePort} port 消息端口
     * @constructor
     */
    constructor(port) {
        super()
        this.listener = {}
        this.context = port
        this.message()
    }
    
    /**
     * 端口消息事件
     * @returns {void}
     * @private
     */
    message() {
        this.context.on("message", (message) => {
            this.listener[message.event](message.payload)  
        })
    }
    
    /**
     * 绑定事件
     * @param {string} event 事件名
     * @param {function} handle 回调
     * @returns {void}
     * @public
     */
    on(event, handle) {
        this.listener[event] = handle
    }
    
    /**
     * 推送事件
     * @param {string} event 事件名
     * @param {any} payload 负载
     * @returns {void}
     * @public
     */
    emit(event, payload) {
        this.context.postMessage({
            event, payload
        })
    }
}