# 为了阅读 Vue 的源码

## 准备按照原项目的 commit 历史一点一点自己写试试

### 这一定是一场持久战

### 12月12日

在看第一个巨大的 commit，按照原来的样子画了个 build.js，但是由于 rollup 版本太老了，已经跑不起来了，以后慢慢改。然后从入口文件开始看，先对 src/instance/index.js 动手，很多问题留在代码文件中，后面看懂了再回来改。

#### 12月16日

看了 src/util/lang.js，主要是框架会用到的一些小函数，看了一遍具体实现。

这里发现了之前的一个理解误区，之前一直以为节流就是防抖，并且还不知道真正的防抖是啥意思。

### 12月17日

看了 observe 目录下的 array.js、batcher.js 和 dep.js，只是简单了解了每个文件的功能。

1. array.js 监控可以使数组发生变动的函数，在变动时做出通知。
2. batcher.js 实现了两个队列，用来处理 watcher，具体待定。
3. dep.js 实现了一个发布订阅，具体也得待定。
