import React from 'react'
import A from '../../components/A'
import B from '../../components/B'
import './index.less'
const a = 'a1'
export default function Index() {
  function renderButton(index) {
    return [
      <div>{index}</div>
    ]
  }
  function onButtonDown(index) {
    console.log('index',index)
  }
  return ( 
    <div className='main'>
      {/* 写法1 */}
      1
      {/* 写法2 */}
      {
        Array(2).fill({}).map((e,i)=>{
          return (
            <button style={{height:50,}} onClick={()=>onButtonDown(i)}>{i}</button>
          )
        })
      }
      {/* 写法3 */}
      {a}
      {/* 写法4 */}
      {renderButton(1)}
      {/* 写法5 */}
      <A name='测试'/>
      {/* 写法6 */}
      <B>{()=> <div>123123122</div>}</B>
      {/* 写法7 */}
      {a == 1 ? <div>12323</div> : <div>2</div>}
    </div>
  )
}

