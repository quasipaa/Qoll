# Qoll
这是一个非常轻量化的Node.JS线程池库，无任何依赖，最小运行时.
该库尽量降低线程池创建的复杂度，并使多线程编程更加简单和人性化.

### 版本
0.0.1 (技术验证版本)


### 概述
先将关键函数转为字符串，通过eval的方式传入子线程, 然后根据指定线程数创建线程池，用户可以自己定义，如果没有定义默认为CPU线程数，并将数据通过`workerData`传入子线程.
用户每次通过传入任务唤醒线程都将调用`poll`函数，并将结果返回给`wake`的调用方.
任务入池的方式都使用谁有空谁处理的方式，如果线程池没有空闲线程，这时候会将任务存入队列，等待线程池空闲之后再次入池.


### 示例
> 这个库依赖与将函数序列化为字符串转移到子线程，所以子线程函数时完全作用域隔离的，无法访问作用域外部.

```js
const {Runtime} = require("qoll")

// 创建线程池
const threads = Runtime.spawn({
    
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
        this.index += param.index
        return {
            index: this.index,
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

```

### License
[MIT](./LICENSE)
Copyright (c) 2020 Mr.Panda.