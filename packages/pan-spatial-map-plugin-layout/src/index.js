/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = api => {
  api.extendQuasarConf(conf => {
    // boot注册
    conf.boot.push(
      '~@mapgis/quasar-app-extension-pan-spatial-map-plugin-layout/src/boot/init.ts'
    )

    conf.framework.plugins.push('LocalStorage')
  })
}
