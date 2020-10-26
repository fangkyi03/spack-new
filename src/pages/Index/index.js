import React from 'react'
import './index.less'
import { Button, Radio } from 'antd'
export default function Index() {
  const [text,setText] = React.useState(Math.random() * 1000)
  return (
    <div style={{display:'flex',flexDirection:'column'}}>
      {
        Array(10).fill({}).map((e,i)=>{
          return (
            <Button>{'112312·1231' + i}</Button>
          )
        })
      }
    </div>
  )
}
