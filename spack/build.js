const config = require('../config')
const tool = require('./tool')
const time = new Date()
config.mode = 'build'
tool.traversalFolder(config)
console.log('代码打包完成', new Date() - time)
