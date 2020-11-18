const fs = require('fs')
const p = require('path')
const babel = require('@babel/core')
const types = require('@babel/types')
const traverse = require('@babel/traverse').default
const less = require('less')
const cache = require('../cache')
const config = require('../../config')

function getImports(imports, dirPath) {
    const that = this
    return {
        ImportDeclaration(path) {
            const { source, specifiers } = path.node
            const { value } = source
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
            } else {
                const localPath = that.getExt(p.join(dirPath, '../', value))
                imports.local.push(localPath)
                if (p.extname(localPath) == '.vue') {
                    const ret = loadImportFormAST.call(that,localPath, false)
                    imports.depend = imports.depend.concat(ret.depend)
                    imports.local = imports.local.concat(ret.local)
                    imports.template = imports.template.concat(ret.template)
                    path.remove()
                } else if (p.extname(localPath) == '.json') {
                    const text = fs.readFileSync(localPath, 'utf-8')
                    const name = value.split('/').slice(-1)[0].split('.')[0] + '__json'
                    const constNameTemplate = babel.template('const %%define%% = %%name%%'.replace('%%name%%', name).replace('%%define%%', names.join(',')))
                    cache.add(localPath, `var ${name} = ` + text, 'utf-8')
                    path.replaceWith(constNameTemplate())
                } else {
                    cache.add(localPath, fs.readFileSync(localPath, 'utf-8'))
                    path.remove()
                }
            }
        }
    }
}

function loadImportFormAST(dirPath) {
    const imports = {
        // 依赖
        depend: [],
        // 本地文件
        local: [],
        // 模板内容
        template:[],
        // 脚本
        script:[]
    }
    const context = fs.readFileSync(dirPath, 'utf-8')
    const template = this.getTemplate(context)
    if (template) imports.template.push(template)
    const scriptText = this.getScriptText(context)
    const tranform = babel.transform(scriptText)
    const ast = babel.parseSync(tranform.code)
    const name = dirPath.split('/').slice(-2)[0]
    const vueConst = babel.template(`window.%%name%% = %%obj%%`.replace('%%name%%', name))
    const vueComponent = babel.template(`Vue.component("%%name%%",%%obj%%)`.replace('%%name%%', name).replace('%%obj%%','window.' + name))
    traverse(ast, {
        ...getImports.call(this,imports, dirPath),
        ExportDefaultDeclaration(path) {
            const node = path.node
            if (node.declaration) {
                const constData = vueConst({ obj: node.declaration})
                path.replaceWithMultiple([constData, vueComponent()])
            }
        },
        StringLiteral(path) {
            if (path.node.value.indexOf('//') !== -1 && path.node.value.indexOf('http') == -1) {
                path.remove()
            }
        },
        ObjectProperty(path) {
            const node = path.node
            if (node.leadingComments) {
                delete node.leadingComments
            }
        },
        CallExpression(path) {
            const node = path.node 
            if (node.callee.name == 'require') {
                const dir = p.join(dirPath,'../',node.arguments[0].value)
                path.replaceWith(types.stringLiteral(dir))
            } else if (node.callee.name == 'h' && node.arguments && node.arguments[0].value.indexOf('An') !== -1) {
                const viewtype = node.arguments[0].value.replace('An','')
                const attrsTemplate = babel.template('{attrs:{viewtype:%%viewtype%%}}')
                node.arguments[0] = types.identifier('Container')
                const arg1 = Object.assign({},node.arguments[1])
                if (node.arguments.length == 1) {
                    node.arguments[1] = types.objectExpression([
                        types.objectProperty(types.stringLiteral('attrs'),
                            types.objectExpression(
                                [
                                    types.objectProperty(types.stringLiteral('viewtype'), types.stringLiteral(viewtype)),
                                ]
                            )
                        )]
                    )
                }else {
                    if (node.arguments[1].type == 'ObjectExpression') {
                        node.arguments[1] = types.objectExpression([
                            types.objectProperty(types.stringLiteral('attrs'),
                                types.objectExpression(
                                    [
                                        types.objectProperty(types.stringLiteral('viewtype'), types.stringLiteral(viewtype)),
                                        types.obje(types.stringLiteral('obj'), arg1.properties ? arg1.properties : types.arrayExpression([])),
                                    ]
                                )
                            )]
                        )
                    }else {
                        node.arguments[1] = types.objectExpression([
                            types.objectProperty(types.stringLiteral('attrs'),
                                types.objectExpression(
                                    [
                                        types.objectProperty(types.stringLiteral('viewtype'), types.stringLiteral(viewtype)),
                                        types.objectProperty(types.stringLiteral('obj'), arg1.properties ? arg1.properties : types.arrayExpression([])),
                                    ]
                                )
                            )]
                        )
                        node.arguments.push(arg1)
                    }
                }
            }
        },
        JSXOpeningElement(path) {
            const node = path.node
            console.log('asas')
        }
    })
    const text = babel.transformFromAstSync(ast, tranform.code)
    cache.add(dirPath, text.code)
    cache.addDepend(dirPath, imports)
    return imports
}

module.exports = {
    loadImportFormAST
}