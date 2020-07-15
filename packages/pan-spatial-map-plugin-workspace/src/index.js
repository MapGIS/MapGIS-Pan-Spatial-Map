/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function init(api) {
  api.extendQuasarConf(conf => {
    conf.boot.push(
      '~@mapgis/quasar-app-extension-pan-spatial-map-plugin-workspace/src/boot/init.ts'
    )
  })

  api.chainWebpack(chain => {
    chain.module
      .rule('typescript')
      .use('ts-loader')
      .loader('ts-loader')
      .tap(options => {
        return { ...options, allowTsInNodeModules: true }
      })
  })
}
