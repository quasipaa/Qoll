/*! Qoll
 * index.js
 * Copyright (c) 2020 Mr.Panda.
 *
 * 这是一个非常轻量化的Node.JS线程池库，无任何依赖，最小运行时.
 * 该库尽量降低线程池创建的复杂度，并使多线程编程更加简单和人性化.
 *
 * 先将关键函数转为字符串，通过eval的方式传入子线程, 然后根据指定线程数创建线程池，用户可以自己定义，如果没有定义默认为CPU线程数，并将数据通过`workerData`传入子线程.
 * 用户每次通过传入任务唤醒线程都将调用`poll`函数，并将结果返回给`wake`的调用方.
 * 任务入池的方式都使用谁有空谁处理的方式，如果线程池没有空闲线程，这时候会将任务存入队列，等待线程池空闲之后再次入池.
 */

"use strict"

const { cpus } = require("os")

exports.DefaultPools = cpus().length
exports.Runtime = require("./runtime")