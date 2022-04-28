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
  port:80,
  // isOpen:true,
  mode:'build',
  depend:{
    'antd':{
      'js':'https://unpkg.com/antd@4.20.1/dist/antd.min.js',
      'css':'https://unpkg.com/antd@4.20.1/dist/antd.min.css',
    },
    'dayjs':'https://unpkg.com/dayjs@1.11.1/dayjs.min.js',
    'moment':'https://unpkg.com/moment@2.29.3/moment.js'
  }
}
