const express = require('express')
const open = require('open')
const app = express()
const fs = require('fs')
const tool = require('./tool')
const p = require('path')
const template = require('./template')
const mime = require('mime-types')
const etag = require('etag')

class Server {
  constructor(config) {
    this.config = config
  }

  start() {
    const {port = 3000,isOpen = false } = this.config
    app.listen(port, () => console.log(`服务已启动 端口号:${port}!`))
    app.get('*', (req, res) => this._serverCallBack(req, res))
    isOpen && open(`http://127.0.0.1:${port}`)
  }

  sendHTML(html, res) {
    const ETag = etag(html);
    const headers = {
      'Content-Type': mime.contentType('js') || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      ETag,
      Vary: 'Accept-Encoding'
    };
    res.writeHead(200, headers);
    res.write(html, 'utf-8');
    res.end()
  }

  _serverCallBack(req, res) {
    const { rootPath = 'src', depend = {}} = this.config
    // 如果不是文件 而是路径的话 则直接加载路径
    if (req.url.indexOf('.') == -1) {
      const path = p.join(rootPath, tool.getFileName(req.url))
      if (fs.existsSync(path)) {
        const imports = tool.scanImport(p.join(path,'index.js'))
        const html = template.getHTMLTemplate(imports,depend)
        res.send(html)
      }
    }
  }
}
module.exports = Server
