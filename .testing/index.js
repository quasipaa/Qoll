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
    async poll({ index, number }) {
        await this.sleep(2000)
        let { sum } = await this.mutex.lock()
        await this.mutex.unlock({ sum: sum + number })
        this.data.index += index
        return { index, sum }
    }
})

// 测试线程池是否正确创建
test("pools", function() {
    expect(threads.pool.length).toBe(DefaultPools)
})

// 测试线程工作是否正常
test("wakes", async function() {
    expect(await threads.wake({ index: 1, number: 1 })).toEqual({ index: 1, sum: 0 })
    expect(await threads.wake({ index: 1, number: 1 })).toEqual({ index: 1, sum: 1 })
    expect(await threads.wake({ index: 1, number: 1 })).toEqual({ index: 1, sum: 2 })
    expect(await threads.wake({ index: 1, number: 1 })).toEqual({ index: 1, sum: 3 })
    expect(await threads.wake({ index: 1, number: 1 })).toEqual({ index: 1, sum: 4 })
    expect(await threads.wake({ index: 2, number: 1 })).toEqual({ index: 2, sum: 5 })
    expect(await threads.wake({ index: 2, number: 1 })).toEqual({ index: 2, sum: 6 })
    expect(await threads.wake({ index: 2, number: 1 })).toEqual({ index: 2, sum: 7 })
    expect(await threads.wake({ index: 2, number: 1 })).toEqual({ index: 2, sum: 8 })
    process.abort()
})