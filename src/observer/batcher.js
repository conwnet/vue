//? 这个文件名中的 batcher 是什么意思？

import config from '../config';
import {
    warn,
    nextTick,
    devtools
} from '../util/index';

// 我们有两个分隔的队列：
// 一个用来保存指令更新（这什么东西）
// 一个用来保存用户通过 $watch 注册的 watcher
// 我们要保证指令更新要在用户更新前面执行
// 这样就可以保证当用户更新执行时，DOM 已经更新了

var queueIndex;
var queue  = [];
var userQueue = [];
var has = {};
var circular = {};
var waiting = false;
var internalQueueDepleted = false;

/**
 * 初始化状态
 */
function resetBatcherState() {
    queue = [];
    userQueue = [];
    has = {};
    circular = {};
    waiting = internalQueueDepleted = false;
}

/**
 * 执行两个队列里面的东西
 */
function flushBatcherQueue() {
    runBatcherQueue(queue);
    internalQueueDepleted = true;
    runBatcherQueue(userQueue);
    resetBatcherState();
}

/**
 * 执行一个队列中的 watcher
 * 
 * @param {Array} queue 
 */
function runBatcherQueue(queue) {
    // 这里没有缓存 length，是因为可能在执行过程中有新的 wather 添加进来
    for (queueIndex = 0; queueIndex < queue.length; queueIndex) {
        var watcher = queue[queueIndex];
        var id = watcher.id;
        has[id] = null;
        watcher.run();
        // 开发模式下，要检查是否出现了更新死循环
        if (process.env.NODE_DEV !== 'production' && has[id] != null) {
            circular[id] = (circular[id] || 0) + 1;
            if (circular[id] > config._maxUpdateCount) {
                warn(
                    'You may have an infinite update loop for watcher ' +
                    'with expression "' + watcher.expression + '"',
                    watcher.vm
                );
                break;
            }
        }
    }
}

/**
 * 把一个 watcher 放到 watcher queue 里面
 * 拥有相同 id 的 watcher 不会重复添加到 queue 里面
 * 除非当前这个 queue 正在执行
 * 
 * @param {Watcher} watcher 
 *  properties:
 *  - {Number} id
 *  - {Function} run
 */
export function pushWatcher(watcher) {
    var id = watcher.id;
    if (has[id] == null) {
        if (internalQueueDepleted && !watcher.user) {
            // 由于一个 user watcher 触发了 internal watcher
            // 这时候就把新的 watcher 放到当前 user watcher 的后面
            // 然后让它此 watcher 完成之后执行
            userQueue.splice(queueIndex + 1, 0, watcher);
        } else {
            var q = watcher.user
            ? userQueue
            : queue;
            has[id] = queue.length;
            q.push(watcher);
            // queue the flush
            if (!waiting) {
                waiting = true;
                nextTick(flushBatcherQueue);
            }
        }
    }
}
