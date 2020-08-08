import {parentPort, workerData} from "worker_threads"
import {Payload} from "./pool"

/**
 * Future
 * @class
 */
export default class Future<T, U, R> {
    private poll_handle: (param: Payload<U>) => Promise<R>
    private init_handle: () => void
    private data: T
    
    /**
     * @param {function} init 初始化函数
     * @param {function} poll 轮询函数
     * @constructor
     */
    constructor(init: Function, poll: Function) {
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
    private init(): void {
        const poll =  this.poll.bind(this)
        parentPort.on("message", poll) 
        this.init_handle()
    }
    
    /**
     * 发送消息到管道
     * @param {string} uid 任务ID
     * @param {Error} reject? 错误
     * @param {any} resolve? 返回数据
     * @returns {void}
     * @private
     */
    private emit(uid: string, resolve: R, reject?: Error): void {
        const error = reject ? reject.message : undefined
        parentPort.postMessage({
            reject: error,
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
    private poll(payload: Payload<U>): void {
        const uid = payload.uid
        this.poll_handle(payload)
            .then(x => this.emit(uid, x))
            .catch(x => this.emit(uid, undefined, x))
    }
}
