const config = require('../config')
const tool = require('./tool')
const { mode = 'dev' } = config
const serverControl = require('./server')
const server = new serverControl(config)
server.start()
