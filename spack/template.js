const p = require('path')
const config = require('../config')

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
function getEmptyHTMLTemplate(isWs = true) {
  const {title} = config
  return `
  <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
      <link rel="icon" href="data:image/ico;base64,aWNv">
      %%%before_injection%%%
      %%%script_link%%%
      %%%after_injection%%%
    </head>
    <body>
      <div id='root'></div>
    </body>
    ${
      isWs
      ? getWS()
      :''
    }
  </html>
  `
}

// 注入前
function getBeforeInjection () {
  return [
    '<script src="https://cdn.bootcdn.net/ajax/libs/babel-standalone/6.25.0/babel.min.js"></script>',
    '<script crossorigin src="https://cdn.bootcdn.net/ajax/libs/react/16.14.0/umd/react.production.min.js"></script>',
    '<script crossorigin src="https://cdn.bootcdn.net/ajax/libs/react-dom/16.14.0/umd/react-dom.production.min.js"></script>'
  ].join('\n')
}

// 注入后
function getAfterInjection() {
  return [
  '<script src="https://cdn.bootcdn.net/ajax/libs/less.js/3.9.0/less.min.js"></script>',
  ].join('\n')
}

// 获取html模板
function getHTMLTemplate(imports, depend) {
  if (Object.keys(depend).length == 0) {
    return getEmptyHTMLTemplate()
  }else {
    const dependList = getDependList(imports.depend,depend)
    const localList = getLocalList(imports.local)
    const text = [].concat(dependList,localList).join('\n')
    const beforeInjection = getBeforeInjection()
    const afterInjection = getAfterInjection()
    return getEmptyHTMLTemplate().replace('%%%script_link%%%', text).replace('%%%before_injection%%%', beforeInjection).replace('%%%after_injection%%%',afterInjection)
  }
}

// 获取编译html模板
function getBuildHTMLTemplate(imports, depend) {
  if (Object.keys(depend).length == 0) {
    return getEmptyHTMLTemplate(false)
  } else {
    const dependList = getDependList(imports.depend, depend)
    const localList = getLocalList(imports.local.map((e)=>p.join('../static',e)))
    const text = [].concat(dependList, localList).join('\n')
    const beforeInjection = getBeforeInjection()
    const afterInjection = getAfterInjection()
    return getEmptyHTMLTemplate(false).replace('%%%script_link%%%', text).replace('%%%before_injection%%%', beforeInjection).replace('%%%after_injection%%%', afterInjection)
  }
}

// 获取本地文件列表
function getLocalList(local) {
  return local.reverse().map((e)=>{
    const ext = p.extname(e)
    switch (ext) {
      case '.js':
        return createScript(e)
      case '.css':
      case '.less':
        return createLink(e)
    }
  })
}

// 获取依赖列表
function getDependList(dependArr,depend) {
  let list = []
  dependArr.forEach((e) => {
    const item = depend[e]
    let ret = ''
    if (typeof item == 'string') {
      ret = createScriptOrLink(item, 'script', true)
      list.push(ret)
    }else if (Array.isArray(item)) {
      item.forEach((el)=>{
        ret = createScriptOrLink(el, 'script', true)
        list.push(ret)
      })
    }else if (typeof item == 'object') {
      Object.keys(item).forEach((el)=>{
        if (el == 'js') {
          ret = createScriptOrLink(item[el], 'script',true)
          list.push(ret)
        }else {
          ret = createScriptOrLink(item[el], 'link')
          list.push(ret)
        }
      })
    }
  })
  return list
}

// 创建脚本
function createScript(path,isDepend = false) {
  return `<script type=${isDepend ? 'text/javascript' : 'text/babel'} src='${path}'></script>`
}

// 创建引入
function createLink(path) {
  const ext = p.extname(path)
  const url = path.indexOf('http') == -1 ? './' + path : path
  return `<link rel=${ext !== '.css' ? 'stylesheet/less' : 'stylesheet'} type="text/css" href="${url}"></link>`
}

// 创建脚本或者css
function createScriptOrLink(path, type, isDepend) {
  switch (type) {
    case 'script':
      return createScript(path, isDepend)
    case 'link':
      return createLink(path)
    default:
      return ''
  }
}

// 获取script数据
function getScript(src) {
  return `<script type='text/babel' src='${src}' ></script>`
}

// 将import转换成text
module.exports = {
  getHTMLTemplate,
  getBuildHTMLTemplate,
  getScript,
  getEmptyHTMLTemplate,
  getBuildHTMLTemplate
}
