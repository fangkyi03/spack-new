function ReactDOM() {
    function render(element,dom) {
        dom.appendChild(element)
    }
    return {
        render
    }
}
window.ReactDOM = ReactDOM()