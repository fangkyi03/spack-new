const config = require('../config')
const tool = require('./tool')
const time = new Date()
console.log('开始打包 请等待')
tool.traversalFolder(config)
// console.log('代码打包完成', new Date() - time)

