const {Runtime, DefaultPools} = require("../")

// 创建线程池
const threads = Runtime.spawn(DefaultPools, {
    
    // 跨线程数据
    mutex: {
        sum: 0
    },
    
    /**
     * 作为初始化数据传入线程
     * 每个线程都是独立非共享数据
     */
    data: {
        index: 0
    },
    
    /**
     * 线程创建时调用, this为内部data
     * 这里添加sleep函数到this上面
     */
    initialize() {
        this.sleep = function(timeout) {
            return new Promise(resolve => {
                setTimeout(resolve, timeout)
            })
        }
    },
    
    /**
     * 每次执行任务时调用, this为内部data
     * 这里对于每次调用传入的参数都附加到
     * 内部的数据缓存上面并返回this的index
     */
    async poll(param) {
        await this.sleep(2000)
        let { sum } = await this.mutex.lock()
        await this.mutex.unlock({ sum: sum + param.number })
        this.data.index += param.index
        return {
            index: this.data.index,
            sum
        }
    }
})

/**
 * 一次性创建99个任务传入线程池
 * 将每次返回的数据打印出来
 */
for (let index = 0; index < 99; index ++) {
    threads
        .wake({index, number: 1})
        .then(console.log)  
}
