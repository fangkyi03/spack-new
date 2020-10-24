const p = require('path')

// 获取空白HTML模板
function getEmptyHTMLTemplate() {
  return `
  <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <script crossorigin src="https://img3.nongbaxian.com.cn/ndcdn/browser.min.js"></script>
      <script crossorigin src="https://img3.nongbaxian.com.cn/ndcdn/react.production.min.js"></script>
      <script crossorigin src="https://img3.nongbaxian.com.cn/ndcdn/react-dom.production.min.js"></script>
      <link rel="icon" href="data:image/ico;base64,aWNv">
      %%%script_link%%%
    </head>
    <body>
      <div id='root'></div>
    </body>
  </html>

  `
}

// 获取html模板
function getHTMLTemplate(imports, depend,local) {
  if (Object.keys(depend).length == 0) {
    return getEmptyHTMLTemplate()
  }else {
    const dependList = getDependList(imports.depend,depend)
    const localList = getLocalList(imports.local)
    const text = [].concat(dependList,localList).join('\n')
    return getEmptyHTMLTemplate().replace('%%%script_link%%%',text)
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
      list.pus(ret)
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
  return `<link rel="stylesheet" href='${path}'></link>`
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
  getScript,
  getEmptyHTMLTemplate
}
