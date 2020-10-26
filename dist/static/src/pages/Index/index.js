const {
  Button,
  Radio
} = antd;

function Index() {
  const [text, setText] = React.useState(Math.random() * 1000);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(Test, null), /*#__PURE__*/React.createElement("div", {
    onClick: () => setText(Math.random() * 1000)
  }, '点击切换' + text), Array(10).fill({}).map((e, i) => {
    return /*#__PURE__*/React.createElement(Button, null, '1' + i);
  }));
}

window.Index = Index;
ReactDOM.render(React.createElement(Index, {}, {}), document.getElementById('root'));