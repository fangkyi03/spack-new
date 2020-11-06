function renderChildren(current,children) {
    if (Array.isArray(children)) {
        children.forEach((e) => {
            renderChildren(current,e)
        })
    } else if (typeof children == 'object' && children instanceof HTMLElement) {
        current.appendChild(children)
    } else {
        current.appendChild(document.createTextNode(children))
    }
}

function renderAttr(current,props) {
    Object.keys(props || {}).forEach((e) => {
        if (e == 'style') {
            Object.keys(props[e]).forEach((styleItem) => {
                const stylesValue = props[e][styleItem]
                if (typeof stylesValue == 'number') {
                    current.style[styleItem] = props[e][styleItem] + 'px'
                } else {
                    current.style[styleItem] = props[e][styleItem]
                }
            })
        } else if (e.indexOf('on') !== -1) {
            const eventName = e.replace('on','').toLowerCase()
            current.addEventListener(eventName,props[e])
        }
        else {
            if (props[e].__proto__ && props[e].__proto__.watch) {
                props[e].__proto__.watch.push(()=>{
                    console.log('测试')
                })
            }else {
                props[e].__proto__.watch = [()=>console.log('测试1')]
            }
            console.log('props[e].prototype.watch', props[e], props[e].__proto__.watch)
            current[e] = props[e]
        }
    })
}

function Component() {
    console.log('er')
}
function createElement(element, props, children, ...arg) {
    if (typeof element == 'function') {
        return element.call({}, { ...props, children }, children)
    } else {
        const elementView = document.createElement(element)
        if (children == '[' && arg && arg.slice(-1)[0] == ']') {
            renderChildren(elementView, arg.slice(0, arg.length - 1))
        } else {
            if (children !== undefined) {
                renderChildren(elementView, children)
            }
            if (arg) {
                renderChildren(elementView, arg)
            }
        }
        if (props) {
            renderAttr(elementView, props)
        }
        return elementView
    }
}

function useState(data) {
    return [0,1]
}
function React() {
    return {
        createElement,
        Component,
        useState
    }
}
window.React = React()