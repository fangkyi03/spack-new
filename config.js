/*
  PORT 端口号设置
  ISOPEN 是否打开浏览器
  ALIAS 别名设置
  MODE 运行模式
  DEVSERVER 开发环境服务
  ROOTPATH 运行的目标路径
  DEPEND 依赖如antd等 支持{js,css}跟字符串两种类型 如果是字符串的话 会默认当做js处理
 */
module.exports = {
  rootPath:'src',
  port:8000,
  // isOpen:true,
  mode:'dev',
  alias:{
    '@':'',
  },
  devServer:{
    proxy:{
      '/api':{
        target: 'http://127.0.0.1:3001',
      }
    }
  },
  depend:{
    'antd':{
      'js':'https://img3.nongbaxian.com.cn/ndcdn/antd.min.js',
      'css':'https://img3.nongbaxian.com.cn/ndcdn/antd.css'
    },
  }
}
