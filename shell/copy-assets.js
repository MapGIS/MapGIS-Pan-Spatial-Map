const fs = require('fs-extra')
const path = require('path')
const sourceCesiumPlugin = path.join(
  __dirname,
  '../node_modules/@mapgis/webclient-cesium-plugin/dist/webclient-cesium-plugin-resource'
)
const destCesiumPlugin = path.join(__dirname, '../public/webclient-cesium-plugin-resource')
fs.copySync(sourceCesiumPlugin, destCesiumPlugin)

const sourceCommon = path.join(__dirname, '../node_modules/@mapgis/webclient-common/dist/webclient-common-resource')
const destCommon = path.join(__dirname, '../public/webclient-common-resource')
fs.copySync(sourceCommon, destCommon)
console.log('✅ 复制资源完成')
