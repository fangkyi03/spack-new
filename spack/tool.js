const babel = require('@babel/core')
const types = require('@babel/types')
const traverse = require('@babel/traverse').default
const fs = require('fs')
const cache = require('./cache')
const p = require('path')

// 获取文件名称
function getFileName(path) {
  switch (path) {
    case '/':
      return 'Index'
    default:
      return path.slice(0, 1).toUpperCase() + path.slice(1)
  }
}

// 扫描依赖
function scanImport(dirPath) {
  const imports = {
    // 依赖
    depend:[],
    // 本地文件
    local:[]
  }
  const context = fs.readFileSync(dirPath,'utf-8')
  const tranform = babel.transform(context)
  const ast = babel.parseSync(tranform.code)
  const depend = cache.getDepend(dirPath)
  const nameTemplate = babel.template(`window.%%name%% = %%name%%`)
  if (depend) return depend
  let name = ''
  traverse(ast,{
    ImportDeclaration(path) {
      const {source} = path.node
      const {value} = source
      if (value.indexOf('.') == -1) {
        imports.depend.push(value)
      }else {
        const localPath = p.join(dirPath, '../', getExt(value))
        imports.local.push(localPath)
        const ret = scanImport(localPath)
        imports.depend = imports.depend.concat(ret.depend)
        imports.local = imports.local.concat(ret.local)
      }
      path.remove()
    },
    ExportDefaultDeclaration(path) {
      const {declaration} = path.node
      const {id} = declaration
      const {name} = id
      path.replaceWith(declaration)
      path.parent.body.push(nameTemplate({ name: types.identifier(name)}))
    }
  })
  const text = babel.transformFromAstSync(ast, tranform.code)
  cache.add(dirPath,text.code)
  return imports
}

// 获取文件后缀格式 默认为js
function getExt(path) {
  const ext = p.extname(path)
  if (ext == '') {
    return path + '.js'
  }else {
    return path
  }
}

module.exports = {
  // 获取文件名称
  getFileName,
  // 扫描依赖
  scanImport,
  // 获取文件后缀格式 默认为js
  getExt
}
