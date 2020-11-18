const cache = require('./../cache')
const config = require('../../config')
const encryption = require('../encryption')
// 获取ws
function getWS() {
    return `
    <script type='text/javascript'>
      var ws = new WebSocket('ws://localhost:8001');
      ws.onmessage = function (e) {
        console.log('接受返回数据', e)
        window.location.reload()
      }
    </script >
  `
}

// 获取空白HTML模板
function getVueEmptyHTMLTemplate(isBuild = true, dirPath) {
    const { title } = config
    const name = dirPath ? dirPath.split('/').slice(-2)[0] : ''
    return `
  <!DOCTYPE html>
    <html lang="en">
    <body>
      <div id='root'></div>
    </body>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
      <link rel="stylesheet" href="http://at.alicdn.com/t/font_2203899_y90swz4cdz.css"/>
      <script crossorigin src="https://cdn.bootcdn.net/ajax/libs/react/16.14.0/umd/react.production.min.js"></script>
      <script crossorigin src="https://cdn.bootcdn.net/ajax/libs/react-dom/16.14.0/umd/react-dom.production.min.js"></script>
      <script src="https://cdn.bootcdn.net/ajax/libs/moment.js/1.0.0/moment.min.js"></script>
      <script src="https://cdn.bootcdn.net/ajax/libs/moment.js/2.29.1/moment-with-locales.min.js"></script>
      <script src="https://cdn.bootcdn.net/ajax/libs/moment.js/2.29.1/locale/zh-cn.min.js"></script>
      <script src="https://cdn.bootcdn.net/ajax/libs/antd/4.7.3/antd.min.js"></script>
      <link href="https://cdn.bootcdn.net/ajax/libs/antd/4.7.3/antd.min.css" rel="stylesheet">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/vant@2.10/lib/index.css"
      />
      <link rel="icon" href="data:image/ico;base64,aWNv">
      %%%before_injection%%%
      %%%script_link%%%
      %%%after_injection%%%
    </head>
    <script>
      new Vue({
        el: '#root',
        template:'<${name}/>'
      })
    </script>
      ${!isBuild ? getWS() : ''}
  </html>
  `
}

// 注入前
function getBeforeInjection() {
    return [
        '<script src="https://cdn.jsdelivr.net/npm/vue"></script>', 
        '<script src="https://cdn.jsdelivr.net/npm/vant@2.10/lib/vant.min.js"></script>'
    ].join('\n')
}

// 注入后
function getAfterInjection() {
    return [
        // '<script src="https://cdn.bootcdn.net/ajax/libs/less.js/3.9.0/less.min.js"></script>',
    ].join('\n')
}

function encry(text) {
  return encryption.jjencode(text,'test')
}

// 获取脚本模板
function getScriptTemplate(script, isBuild) {
  return script.map((e) => {
    return `<script src="${isBuild ? '../static/' + e : e}" type="text/javascript"></script>`
  })
}

// 获取css模板
function getCSSTemplate(styles, isBuild) {
  const stylesText = styles.join('\n')
  cache.add('command.css',stylesText)
  return `<link rel="stylesheet" type="text/css" href="${isBuild ? '../static/command.css' : 'command.css'}"></link>`
}

// 获取html模板
function getVueHTMLTemplate(imports,dirPath,isBuild = false) {
    const scriptTemplate = getScriptTemplate(imports.local,isBuild)
    const styleTemplate = getCSSTemplate(imports.styles,isBuild)
    const beforeInjection = getBeforeInjection()
    const afterInjection = getAfterInjection()
    const im = [].concat(styleTemplate,scriptTemplate).filter((e) => e).join('\n')
    return getVueEmptyHTMLTemplate(isBuild,dirPath)
    .replace('%%%before_injection%%%', beforeInjection)
    .replace('%%%script_link%%%', im)
    .replace('%%%after_injection%%%', afterInjection)
}

// 获取html模板
function getVueBuildHTMLTemplate(imports, dirPath, isBuild = false) {
  const scriptTemplate = getScriptTemplate(imports.local, isBuild)
  const styleTemplate = getCSSTemplate(imports.styles, isBuild)
  const beforeInjection = getBeforeInjection()
  const afterInjection = getAfterInjection()
  const im = [].concat(styleTemplate, scriptTemplate).filter((e) => e).join('\n')
  return getVueEmptyHTMLTemplate(isBuild, dirPath)
    .replace('%%%before_injection%%%', beforeInjection)
    .replace('%%%script_link%%%', im)
    .replace('%%%after_injection%%%', afterInjection)
}


module.exports = {
  getVueHTMLTemplate,
  getVueBuildHTMLTemplate
}