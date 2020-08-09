# Qoll

This is a very lightweight Node.JS thread pool library with no dependencies and a very small runtime.
This library minimizes the complexity of creating thread pools and makes multithreaded programming easier and more user-friendly.

### Version
0.0.1


### Overview
The function is converted to a string, passed in as an eval string to a child thread, and then a thread pool is created based on the specified number of threads, which the user can define or default to CPU threads if not defined, and the data is passed in through `workerData` to the child thread.</br>
Whenever a user wakes up a thread, the `poll` function is called and the result is returned to the caller of `wake`.</br>
When a task enters the thread pool, the behavior of scheduling is that if there are free threads, the task is assigned to the free thread. If there are no free threads in the thread pool, the task is put in a wait queue, waiting for the thread pool to be free and then assigned to the free thread pool again.</br>
> The way the library works depends on serializing the function to a string and then transferring it to a child thread, so the scope of the child thread function is completely isolated and the function cannot access the outside of the scope.


### Quick start

You need to install this library into your project through `npm` first:
```bash
npm install qoll
```

Then introduce this library into your project:
```js
// Export runtime and default thread count
const {Runtime, DefaultPools} = require("qoll")
```

Then we start creating thread pools:
```js
const threads = Runtime.spawn(DefaultPools, {
    
    // Sharing data across threads
    mutex: {
        sum: 0
    },
    
    // Independent data for child threads
    data: {
        index: 0
    },
    
    /**
     * Called when a thread is created, 
     * this is private data,
     * I'm going to add the sleep function to this.
     */
    initialize() {
        this.sleep = function(timeout) {
            return new Promise(resolve => {
                setTimeout(resolve, timeout)
            })
        }
    },
    
    /**
     * Called each time a task executes,
     * this is private data,
     * here we simulate a CPU-intensive computing task.
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
```

After the thread pool is created, we will wake up the thread pool with batch creation task and output the callback result:
```js
/**
 * Create 99 tasks to pass to the thread pool,
 * print out the data returned each time.
 */
for (let index = 0; index < 99; index ++) {
    threads
        .wake({index, number: 1})
        .then(console.log)  
}
```

The full example is [here](./example/mock.js).


### License
[MIT](./LICENSE)
Copyright (c) 2020 Mr.Panda.