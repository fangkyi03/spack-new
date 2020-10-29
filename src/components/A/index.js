import React from 'react'

export default function A(props) {
    const { name, children} = props
    return (
        <div>
            组件{name}
        </div>
    )
}
