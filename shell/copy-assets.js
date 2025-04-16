const fs = require('fs-extra')
const path = require('path')
const source = path.join(
  __dirname,
  '../node_modules/@mapgis/webclient-cesium-plugin/dist/webclient-cesium-plugin-resource'
)
const dest = path.join(__dirname, '../public/webclient-cesium-plugin-resource')
fs.copySync(source, dest)
console.log('✅ 复制资源完成')
