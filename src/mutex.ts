"use strict"

/**
 * 锁标记
 * @param {any} value 源数据
 * @returns {object}
 * @public
 */
module.exports = function(value) {
    return { value, ___mutex: true }
}

/**
 * 锁核心
 * @class
 */
exports.MutexCore = class MutexCore {
    constructor() {
        
    }
}