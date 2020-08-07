# Qoll

这是一个非常轻量化的Node.JS线程池库，无任何依赖，最小运行时.
该库尽量降低线程池创建的复杂度，并使多线程编程更加简单和人性化.
> 这个库依赖与将函数序列化为字符串转移到子线程，所以子线程函数时完全作用域隔离的，无法访问作用域外部.


### 版本
0.0.1 (技术验证版本)


### 示例
```js
const {spawn} = require("qoll")

// 创建线程池
const threads = spawn({
    
    /**
     * 数据缓存
     * 作为初始化数据传入线程
     * 每个线程都是独立非共享数据
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
        // 这是独立作用域
        this.sleep = (timeout) => {
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
        // 这是独立作用域
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
```

### License
[MIT](./LICENSE)
Copyright (c) 2020 Mr.Panda.