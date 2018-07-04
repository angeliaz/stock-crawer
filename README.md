## puppeteer

    (https://www.jianshu.com/p/a9a55c03f768)[https://www.jianshu.com/p/a9a55c03f768]
    (http://www.r9it.com/20171106/puppeteer.html)[http://www.r9it.com/20171106/puppeteer.html]

## koa
    (https://chenshenhai.github.io/koa2-note/note/static/server.html)[https://chenshenhai.github.io/koa2-note/note/static/server.html]

### router

    
### post
    对于POST请求的处理，koa-bodyparser中间件可以把koa2上下文的formData数据解析到ctx.request.body中

### async
1. map内部是并发执行的
2. for..of 循环内部使用了await， 是按顺序执行的

[数组的异步遍历](https://segmentfault.com/a/1190000014598785)

### canvas 
    https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes

    1. lineWidth 线宽是指给定路径的中心到两边的粗细。换句话说就是在路径的两边各绘制线宽的一半
    2. 导致1px线条模糊https://segmentfault.com/a/1190000004505090
        把线条中线和和像素中间点对齐就行了
        向后移动0.5px ctx.moveTo(100.5, 100.5) 或 ctx.translate(0.5, 0.5);

### canvas1px线条模糊问题
    https://segmentfault.com/a/1190000009396591
    1. 画布尺寸设为显示尺寸的两倍即可

### canvas优化
    http://www.cnblogs.com/mopagunda/p/5622911.html