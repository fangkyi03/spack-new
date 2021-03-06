/*
  PORT 端口号设置
  ISOPEN 是否打开浏览器
  MODE 运行模式
  // DEVSERVER 开发环境服务
  ROOTPATH 运行的目标路径
  OUTPATH 打包输出目录
  // ALIAS 别名设置
  DEPEND 依赖如antd等 支持{js,css}跟字符串两种类型 如果是字符串的话 会默认当做js处理
 */
module.exports = {
  rootPath:'src/pages',
  outPath:'dist',
  port:8000,
  // isOpen:true,
  mode:'build',
  depend:{
    'antd':{
      'js':'https://cdn.bootcdn.net/ajax/libs/antd/4.7.0/antd.min.js',
      'css':'https://cdn.bootcdn.net/ajax/libs/antd/4.7.0/antd.min.css'
    },
    'dayjs':'https://cdn.bootcdn.net/ajax/libs/dayjs/1.4.1/dayjs.min.js',
    'moment':'https://cdn.bootcdn.net/ajax/libs/moment.js/1.0.0/moment.min.js'
  }
}
