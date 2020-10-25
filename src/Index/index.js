import React from 'react'
import './index.less'
import A from './a'
import { Button, Radio } from 'antd'
export default function Index() {
  const [text,setText] = React.useState(Math.random() * 1000)
  return (
    <div onClick={()=>setText(Math.random() * 1000)}>
      <A text={text}></A>
    </div>
  )
}
