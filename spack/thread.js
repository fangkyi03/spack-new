const os = require('os')
const { StaticPool } = require("node-worker-threads-pool");

function task({ item, rootPath, depend } = {}) {
  const p = require('path')
  function scanImport(dirPath, isRoot = false) {
    const imports = {
      // 依赖
      depend: [],
      // 本地文件
      local: []
    }
    const context = fs.readFileSync(dirPath, 'utf-8')
    const tranform = babel.transform(context)
    const ast = babel.parseSync(tranform.code)
    const nameTemplate = babel.template(`window.%%name%% = %%name%%`)
    const reactDOM = babel.template(`ReactDOM.render(React.createElement(%%name%%,{},{}),document.getElementById('root'))`)
    traverse(ast, {
      ImportDeclaration(path) {
        const { source, specifiers } = path.node
        const { value } = source
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
        } else {
          const localPath = getExt(p.join(dirPath, '../', value))
          imports.local.push(localPath)
          if (p.extname(localPath) == '.js') {
            imports.depend = imports.depend.concat(ret.depend)
            imports.local = imports.local.concat(ret.local)
          } else {
            // cache.add(localPath, fs.readFileSync(localPath, 'utf-8'))
          }
          path.remove()
        }
      },
      ExportDefaultDeclaration(path) {
        const { declaration } = path.node
        const { id } = declaration
        const { name } = id
        path.replaceWith(declaration)
        if (isRoot) {
          path.parent.body.push(nameTemplate({ name: types.identifier(name) }))
          path.parent.body.push(reactDOM({ name: types.identifier(name) }))
        } else {
          path.parent.body.push(nameTemplate({ name: types.identifier(name) }))
        }
      }
    })
    const text = babel.transformFromAstSync(ast, tranform.code)
    cache.add(dirPath, text.code)
    return imports
  }
  return item
}

function startThread({ item, rootPath, depend} = {}) {
  const staticPool = new StaticPool({size: os.cpus().length,task})
  return staticPool.exec({item,rootPath,depend})
}

module.exports = {
  startThread
}
