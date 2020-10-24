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

// 获取文件路径
function getFilePath(path,url) {
  const filePath = p.join(path,getFileName(url))
  const react = p.join(filePath,'index.js')
  const vue = p.join(filePath,'index.vue')
  if (fs.existsSync(react)) {
    return react
  }else {
    return vue
  }
}

// 扫描依赖
function scanImport(dirPath,isRoot = false) {
  const imports = {
    // 依赖
    depend:[],
    // 本地文件
    local:[]
  }
  const context = fs.readFileSync(dirPath,'utf-8')
  const tranform = babel.transform(context)
  const ast = babel.parseSync(tranform.code)
  const nameTemplate = babel.template(`window.%%name%% = %%name%%`)
  const reactDOM = babel.template(`ReactDOM.render(React.createElement(%%name%%,{},{}),document.getElementById('root'))`)
  traverse(ast,{
    ImportDeclaration(path) {
      const {source,specifiers} = path.node
      const {value} = source
      if (value.indexOf('.') == -1) {
        imports.depend.push(value)
        const names = specifiers.map((e) => e.local.name)
        const isDefault = specifiers.some((e) => e.type == 'ImportDefaultSpecifier')
        if (isDefault) {
          path.remove()
        } else {
          const constTemplate = babel.template('const {%%define%%} = %%name%%'.replace('%%name%%', value).replace('%%define%%', names.join(',')))
          path.replaceWith(constTemplate())
        }
      }else {
        const localPath = p.join(dirPath, '../', getExt(value))
        imports.local.push(localPath)
        if (p.extname(localPath) == '.js') {
          const ret = scanImport(localPath)
          imports.depend = imports.depend.concat(ret.depend)
          imports.local = imports.local.concat(ret.local)
        }else {
          cache.add(localPath,fs.readFileSync(localPath,'utf-8'))
        }
        path.remove()
      }
    },
    ExportDefaultDeclaration(path) {
      const {declaration} = path.node
      const {id} = declaration
      const {name} = id
      path.replaceWith(declaration)
      if (isRoot) {
        path.parent.body.push(nameTemplate({ name: types.identifier(name) }))
        path.parent.body.push(reactDOM({ name: types.identifier(name) }))
      }else {
        path.parent.body.push(nameTemplate({ name: types.identifier(name) }))
      }
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
  getExt,
  // 获取文件路径
  getFilePath
}
