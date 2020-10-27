const os = require('os')
const { StaticPool } = require("node-worker-threads-pool");

function task({ item, rootPath, depend } = {}) {
  const p = require('path')
  const fs = require('fs')
  console.log('item',item)
  // const { getBuildHTMLTemplate } = require('./template')
  // const { scanImport, createPage, mkdir } = require('./tool')
  // const filePath = p.join(rootPath, item, 'index.js')
  // const imports = scanImport(filePath, true)
  // imports.local.unshift(filePath)
  // imports.local.forEach((el) => {
  //   const cwd = process.cwd()
  //   const target = p.join(cwd, outPath, 'static')
  //   const end = p.join(target, el)
  //   mkdir(target, el)
  //   fs.writeFileSync(end, cache.get(el), 'utf-8')
  // })
  // const html = getBuildHTMLTemplate(imports, depend)
  // createPage(p.join(outPath, item), html)
}

function openThread({ item, rootPath, depend} = {}) {
  const { getBuildHTMLTemplate } = this.require('./template')
  console.log('aitem, rootPath, depend')
  return 1
}

module.exports = {
  openThread
}
