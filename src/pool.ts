import {Worker} from "worker_threads"
import {EventEmitter} from "events"
import {Option} from "./"
import {cpus} from "os"

/**
 * 负载
 * @param {string} uid
 * @param {any} data 数据
 */
export interface Payload<T> {
    reject: string
    uid: string
    resolve: T
}

/**
 * 线程
 * @param {Worker} worker
 * @param {number} index 编号索引
 * @param {boolean} done 是否空闲
 */
export interface Thread {
    worker: Worker
    index: number
    done: boolean
}

/**
 * 任务
 * @param {function} [reject] 回调错误
 * @param {function} [resolve] 回调结果
 * @param {boolean} [alloc] 是否分配
 * @param {any} [payload] 任务参数
 */
export interface Task<T, R> {
    reject: (error: Error) => void
    resolve: (res: R) => void
    alloc: boolean
    payload: T
}

/**
 * 线程池
 * @class
 */
export default class Pool<D, P, U> extends EventEmitter {
    private queue: {[key: string]: Task<P, U>}
    private pool: Array<Thread>
    private index: number
    private size: number

    /**
     * @param {object} data? 数据
     * @param {string} context 句柄字符串
     * @param {number} [option.workers?] 启动线程数
     * @constructor
     */
    constructor(data: D | undefined, context: string, option: Option) {
        super()
        this.index = 0
        this.pool = []
        this.queue = {}
        this.size = option.workers || cpus().length
        this.init(data, context)
    }
    
    /**
     * 初始化
     * @param {object} workerData 数据
     * @param {string} context 句柄字符串
     * @returns {void}
     * @private
     */
    private init(workerData = {}, context: string): void {
        this.on("__change", this.update.bind(this))
        this.pool = new Array(this.size).fill(null)
            .map(() => new Worker(context, {workerData, eval: true}))
            .map((worker, index) => ({index, worker, done: true}))
        this.pool.forEach(({worker}, index) => {
            worker.on("message", value => {
                this.watch(index, value)
            })
        })
    }
    
    /**
     * 队列更新
     * @returns {void}
     * @private
     */
    private update(): void {
        const free = this.pool.filter(x => x.done)
        if (free.length === 0) return undefined
        const keys = Object
            .keys(this.queue)
            .filter(x => !this.queue[x].alloc)
            .slice(0, free.length)
        keys.forEach((uid, i) => {
            const {worker, index} = free[i]
            const {payload} = this.queue[uid]
            worker.postMessage({payload, uid})
            this.pool[index].done = false
            this.queue[uid].alloc = true
        })
    }
    
    /**
     * 响应监听
     * @param {number} index 索引
     * @param {any} response 响应
     * @returns {void}
     * @private
     */
    private watch(index: number, response: Payload<U>): void {
        this.pool[index].done = true
        const {reject, resolve} = this.queue[response.uid]
        response.reject && reject(new Error(response.reject))
        response.resolve && resolve(response.resolve)
        delete this.queue[response.uid]
        this.emit("__change")
    }
    
    /**
     * uid
     * @returns {string}
     * @private
     */
    private uid(): string {
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
    public wake(payload: P): Promise<U> {
        const uid = this.uid()
        return new Promise((resolve, reject) => {
            this.queue[uid] = {payload, resolve, reject, alloc: false}
            this.emit("__change")
        })
    }
}
