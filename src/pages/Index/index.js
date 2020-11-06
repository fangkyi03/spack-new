import React from 'react'
import A from '../../components/A'
import B from '../../components/B'
import './index.less'
let a = 'a1'
export default function Index() {
  console.log('12312')
  const name = new Proxy(['main'], {
    get: (obj, prop, receiver) => {
      return obj[prop]
    },
    set: (obj, prop, newva) => {
      console.log('obj, prop, newva', obj, prop, newva, obj[prop].__proto__)
      console.log('arguments.callee', arguments.callee())
      obj[prop] = newva
      return true
    }
  })
  function renderButton(index) {
    return [
      <div>{index}</div>
    ]
  }
  function onButtonDown(index) {
    name[0] = 2
  }
  return ( 
    <div className='main'>
      {/* 写法7 */}
      {name[0] == 1 ? <div>12323</div> : <div onClick={onButtonDown}>2</div>}
    </div>
  )
}

