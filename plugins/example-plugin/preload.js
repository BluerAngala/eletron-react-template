// preload.js — 插件预加载脚本
// 该脚本可以调用 Node.js 原生 API，通过 window 对象暴露给前端

const fs = require('fs')
const path = require('path')

// 暴露自定义 API 给前端
window.myPluginApi = {
  // 读取文件内容
  readFile: (filePath) => {
    try {
      return fs.readFileSync(filePath, 'utf-8')
    } catch (e) {
      return null
    }
  },

  // 获取文件信息
  getFileInfo: (filePath) => {
    try {
      const stat = fs.statSync(filePath)
      return {
        size: stat.size,
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory(),
        modifiedAt: stat.mtime.toISOString(),
      }
    } catch (e) {
      return null
    }
  },

  // 写入文件
  writeFile: (filePath, content) => {
    try {
      const dir = path.dirname(filePath)
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(filePath, content, 'utf-8')
      return true
    } catch (e) {
      return false
    }
  },
}