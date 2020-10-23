const config = require('../config')
const {mode = 'dev'} = config
if (mode == 'dev') {
  const serverControl = require('./server')
  const server = new serverControl(config)
  server.start()
}else {

}
