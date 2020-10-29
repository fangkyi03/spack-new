const express = require('express')
const open = require('open')
const app = express()
const fs = require('fs')
const tool = require('./tool')
const p = require('path')
const template = require('./template')
const mime = require('mime-types')
const etag = require('etag')
const cache = require('./cache')
const chokidar = require('chokidar')
const { exception } = require('console')
const WebSocketServer = require('ws').Server

class Server {
  constructor(config) {
    this.config = config
    this.bindWatch()
  }

  bindWatch() {
    this.wss = new WebSocketServer({ port: 8001 });
    this.wss.on('connection', (wss) => {
      const watch = chokidar.watch('src', {
        // ignored: config.exclude,
        persistent: true,
        ignoreInitial: true,
        disableGlobbing: false
      })
      watch.on('change', (filePath) => {
        console.log('发生文件变动')
        wss.send('reload')
        console.log('更新完成')
      })
    })
  }

  start() {
    const {port = 3000,isOpen = false } = this.config
    app.listen(port, () => console.log(`服务已启动 端口号:${port}!`))
    app.all('*',this._serverCallBack)
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

  _serverCallBack = (req, res) => {
    const { rootPath = 'src/pages', depend = {}} = this.config
    try {
      // 如果不是文件 而是路径的话 则直接加载路径
      if (req.url.indexOf('.') == -1) {
        const path = p.join(tool.getFilePath(rootPath, req.url))
        if (fs.existsSync(path)) {
          const imports = tool.scanImport(path, true)
          imports.local.unshift(path)
          const html = template.getHTMLTemplate(imports, depend)
          return res.send(html)
        }else {
          throw new Error('未找到指定文件路径:' + path)
        }
      } else if (req.url !== '/favicon.ico') {
        return this.sendHTML(cache.get(req.url.slice(1)), res)
      } else {
        return this.sendHTML('', res)
      }
    } catch (error) {
      const html = template.getEmptyHTMLTemplate().replace('%%%before_injection%%%', '').replace('%%%script_link%%%', '').replace('%%%after_injection%%%','')
      return res.send(html)
    }
  }
}
module.exports = Server
