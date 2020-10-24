# 介绍
只为追求极限的打包性能 毫秒级热更新 毫秒级启动 毫秒级编译是最终目标
不过因为追求极限性能 所以在代码编写过程中 有部分是需要你进行人工规避的

比如
```javascript
// 这里的moment全部按照你引入的包文件而来 所以你前面写的import moment是没有意义的
// 其实可以简化为 import 'moment' 带来的效果是一样的
import moment from 'moment'
// 另一个地方在于 如果你访问的文件夹是Index那么你的js文件中export default必须跟文件夹同名 大小写要一致
// 否则会找不到文件
export default function Index() {
  return (
    <Input placeholder='测试'></Input>
  )
}

```

# 使用说明
```javascript
  // 启动
  npm run dev
```
