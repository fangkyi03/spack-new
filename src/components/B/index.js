import React from 'react'

export default function B(props) {
    const {children} = props
    return (
        <div>
            {children()}
        </div>
    )
}
