const {spawn} = require("../src")

// 创建线程池
const threads = spawn({
    
    /**
     * 数据缓存
     * 作为初始化数据传入线程
     * 每个线程都是独立非共享数据
     * 
     * 如果需要共享数据
     * 可以使用跨线程锁
     * 使用Mutex标记
     */
    data: {
        index: 0
    },
    
    /**
     * 线程创建时调用
     * this为数据缓存
     * 这里添加sleep函数到this上面
     */
    init() {
        this.sleep = (timeout: number) => {
            return new Promise(resolve => {
                setTimeout(resolve, timeout)
            })
        }
    },
    
    /**
     * 每次执行任务时调用
     * this为数据缓存
     * 这里对于每次调用传入的参数都附加到
     * 内部的数据缓存上面并返回this的index
     */
    async poll(param) {
        await this.sleep(2000)
        this.index += param.index
        return this.index
    }
})

/**
 * 一次性创建99个任务传入线程池
 * 将每次返回的数据打印出来
 */
for (let index = 0; index < 99; index ++) {
    threads.wake({index}).then(console.log)  
}
