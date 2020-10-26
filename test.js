const fs = require('fs')
const p = require('path')

function getComponentTemplate(componentName) {
  return `
    import React from 'react'
    export default function ${componentName}() {
      return (
        <div>
          123
        </div>
      )
    }

  `
}

function getPageTemplate(componentName,pageName) {
  return `
  import React from 'react'
  import ${componentName} from '../../components/${componentName}'
  import { Button, Radio } from 'antd'
  export default function ${pageName}() {
    const [text,setText] = React.useState(Math.random() * 1000)
    return (
      <div style={{display:'flex',flexDirection:'column'}}>
        <${componentName}/>
        <div onClick={()=>setText(Math.random() * 1000)}>{'点击切换' + text}</div>
        {
          Array(10).fill({}).map((e,i)=>{
            return (
              <Button>{'1' + i}</Button>
            )
          })
        }
      </div>
    )
  }
`
}

function main() {
  Array(1000).fill({}).forEach((e,i)=>{
    const pageName = 'Index' + i
    const componentName = 'Demo' + i
    const page = getPageTemplate(componentName,pageName)
    const component = getComponentTemplate(componentName)
    const pagePath = p.join('src', 'pages', pageName)
    const componentPath = p.join('src', 'components', componentName)
    if (!fs.existsSync(pagePath)) {
      fs.mkdirSync(pagePath)
    }
    if (!fs.existsSync(componentPath)) {
      fs.mkdirSync(componentPath)
    }
    fs.writeFileSync(p.join(process.cwd(),pagePath,'index.js'),page)
    fs.writeFileSync(p.join(process.cwd(),componentPath, 'index.js'), component)
  })
}

main()
