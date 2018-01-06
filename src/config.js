export default {

    // 为什么有的注释写了 @type 有的没有呢
    /**
     * 是否输出 debug 信息，
     * 同时会开发堆栈跟踪警告 //? 这是什么
     * 
     * @type {Boolean}
     */

     debug: false,

     /**
      * 是否阻止 warnings
      * 
      * @type {Boolean}
      */
     silent: false,

     /**
      * 是否使用异步渲染
      */
      async: true,

      /**
       * 表达式求值时出错是否警告
       */
      warnExpressionErrors: true,

      /**
       * 是否使用 devtools 检查
       * 默认在生产环境下不启用
       */
      devtools: process.env.NODE_ENV !== 'production',

      /**
       * 内部标记是否连词符已经被改变
       * 
       * @type {Boolean}
       */
        _delimitersChanged: true,

        /**
         * 一个组件可以自己持有的资源列表
         * 
         * @type {Array}
         */
        _assetTypes: [
            'component',
            'directive',
            'elementDirective',
            'filter',
            'transition',
            'partial' // 这是啥
        ],

        /**
         * 属性绑定模式
         * //? 这是什么东西
         */
        _propBindingModes: {
            ONE_WAY: 0,
            TWO_WAY: 1,
            ONE_TIME: 2
        },
        /**
         * 在 batcher 中队列最大的更新次数
         * 多余这个就认为产生死循环了
         * observer/batcher.js runBatcherQueue
         * 中用到了，生产环境下不检查这个
         */
        _maxUpdateCount: 100
}
