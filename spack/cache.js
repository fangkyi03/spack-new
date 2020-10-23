class Cache {
  constructor() {
    this.cache = {}
    this.depend = {}
  }
  // 添加依赖
  addDepend(path,depend) {
    this.depend[path] = depend
  }
  // 获取依赖
  getDepend(path) {
    return this.depend[path]
  }
  add(path,context) {
    this.cache[path] = context
  }
  get(path) {
    return this.cache[path]
  }
}
module.exports = new Cache()
