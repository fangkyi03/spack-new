const babel = require('@babel/core')
const types = require('@babel/types')
const traverse = require('@babel/traverse').default
const fs = require('fs')
const cache = require('./cache')
const p = require('path')
const child = require('child_process')
const { getBuildHTMLTemplate } = require('./template')

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
  const importDepend = cache.getDepend(dirPath)
  // if (isRoot && importDepend) {
  //   return importDepend
  // }
  const context = fs.readFileSync(dirPath,'utf-8')
  const tranform = babel.transform(context)
  const ast = babel.parseSync(tranform.code)
  const nameTemplate = babel.template(`window.%%name%% = %%name%%`)
  const reactDOM = babel.template(`ReactDOM.render(React.createElement(%%name%%,{},{}),document.getElementById('root'))`)
  traverse(ast,{
    ImportDeclaration(path) {
      const {source,specifiers} = path.node
      const {value} = source
      const names = specifiers.map((e) => e.local.name)
      if (value.indexOf('.') == -1) {
        imports.depend.push(value)
        const isDefault = specifiers.some((e) => e.type == 'ImportDefaultSpecifier')
        if (isDefault) {
          path.remove()
        } else {
          const constTemplate = babel.template('const {%%define%%} = %%name%%'.replace('%%name%%', value).replace('%%define%%', names.join(',')))
          path.replaceWith(constTemplate())
        }
      }else {
        const localPath = getExt(p.join(dirPath, '../', value))
        imports.local.push(localPath)
        if (p.extname(localPath) == '.js') {
          const ret = scanImport(localPath, isRoot)
          imports.depend = imports.depend.concat(ret.depend)
          imports.local = imports.local.concat(ret.local)
          path.remove()
        }else if (p.extname(localPath) == '.json'){
          const text = fs.readFileSync(localPath, 'utf-8')
          const name = value.split('/').slice(-1)[0].split('.')[0] + '__json'
          const constNameTemplate = babel.template('const %%define%% = %%name%%'.replace('%%name%%', name).replace('%%define%%', names.join(',')))
          cache.add(localPath, `var ${name} = ` + text, 'utf-8')
          path.replaceWith(constNameTemplate())
        }else {
          cache.add(localPath, fs.readFileSync(localPath, 'utf-8'))
          path.remove()
        }
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
  cache.addDepend(dirPath,imports)
  return imports
}

// 获取文件后缀格式 默认为js
function getExt(path) {
  const ext = p.extname(path)
  if (ext == '') {
    const filePath = p.join(path)
    const jsPath = filePath + '.js'
    const indexPath = p.join(filePath,'index.js')
    const files = [jsPath,indexPath]
    const findResult = files.find((e)=> fs.existsSync(e))
    return findResult || path
  }else {
    return path
  }
}

// 创建文件夹
function mkdir(target,dir) {
  const dirs = dir.split('/').filter((e)=>e.indexOf('.') == -1)
  dirs.forEach((e,i)=>{
    let dirPath = p.join(target,dirs.slice(0, i + 1).join('/'))
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }
  })
}

// 创建page
function createPage(path,html) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
  fs.writeFileSync(p.join(path,'index.html'),html,'utf-8')
}

// 遍历指定文件夹
function traversalFolder(config) {
  const { rootPath, outPath = 'dist', depend = {}} = config
  child.execSync('rm -rf ' + outPath)
  if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath)
    fs.mkdirSync(outPath + '/static')
  }
  const dirArr = fs.readdirSync(rootPath)
  dirArr.forEach((e)=>{
    const filePath = p.join(rootPath, e, 'index.js')
    const imports = scanImport(filePath,true)
    imports.local.unshift(filePath)
    imports.local.forEach((el)=>{
      const cwd = process.cwd()
      const target = p.join(cwd, outPath,'static')
      const end = p.join(target,el)
      mkdir(target,el)
      fs.writeFileSync(end,cache.get(el),'utf-8')
    })
    const html = getBuildHTMLTemplate(imports, depend)
    createPage(p.join(outPath, e), html)
  })
}

function loadVueAST (content) {
  const tranform = babel.transform(content)
  const ast = babel.parseSync(tranform.code)
  const vueComponent = babel.template(`Vue.component("%%name%%",%%obj%%)`.replace('%%name%%','App'))
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const node = path.node
      if (node.declaration) {
        path.replaceWith(vueComponent({obj:node.declaration}))
      }
    },
    // CallExpression(path) {
    //   const node = path.node 
    //   if (node.callee && node.callee.property && node.callee.property.name.indexOf('render') !== -1) {
    //     if (Array.isArray(node.arguments)) {
    //       node.arguments.unshift(types.identifier('h'))
    //     }else {
    //       node.arguments = [types.identifier('h')]
    //     }
    //   }
    // },
    // ObjectMethod(path) {
    //   const node = path.node
    //   if (node.key.name.indexOf('render') !== -1 && node.key.name !== 'render') {
    //     if (Array.isArray(node.params)) {
    //       node.params.unshift(types.identifier('h'))
    //     } else {
    //       node.params = [types.identifier('h')]
    //     }
    //   }
    // }
  })
  const text = babel.transformFromAstSync(ast, tranform.code)
  return text.code
}

function getScriptText(content) {
  return content.match(/<script.*?>([\s\S]+?)<\/script>/)[0].replace('<script>','<script type="text/javascript">')
}

function getStylesContent(content) {
  const match = content.match(/<style.*?>([\s\S]+?)<\/style>/)
  return match ? match[0] : ''
}

function getTemplate(content) {
  const match = content.match(/<template.*?>([\s\S]+?)<\/template>/)
  return match ? match[0] : ''
}

function scanVueImport (path) {
  const content = fs.readFileSync(path,'utf-8')
  const template = getTemplate(content)
  const scriptText = getScriptText(content)
  const text = scriptText.replace('<script type="text/javascript">','').replace('</script>','')
  const vueContent = loadVueAST(text)
  const script = `<script type="text/javascript">${vueContent}</script>`
  const style = getStylesContent(content)
  return {
    script,
    style,
    template
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
  getFilePath,
  // 遍历文件夹
  traversalFolder,
  // 扫描vue导入文件
  scanVueImport
}
