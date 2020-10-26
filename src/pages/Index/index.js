import React from 'react'
import './index.less'
import Test from '../../components/Test'
import { Button, Radio } from 'antd'
export default function Index() {
  const [text,setText] = React.useState(Math.random() * 1000)
  return (
    <div style={{display:'flex',flexDirection:'column'}}>
      <Test/>
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
