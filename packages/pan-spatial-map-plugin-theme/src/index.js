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
      '~@mapgis/quasar-app-extension-pan-spatial-map-plugin-theme/src/boot/init.ts'
    )
    conf.css.push(
      '~@mapgis/quasar-app-extension-pan-spatial-map-plugin-theme/src/css/pan-spatial-map.scss'
    )

    conf.framework.config = conf.framework.config || {}
    conf.framework.config.brand = conf.framework.config.brand || {}
    conf.framework.config.brand['bg-title'] = 'rgba(2,123,227,1)'
    conf.framework.config.brand['text-title'] = 'rgba(255,255,255,1)'
    conf.framework.config.brand['bg-container'] = 'rgba(255, 255, 255, 1)'
    conf.framework.config.brand['text-container'] = 'rgba(0,0,0,1)'

    conf.framework.all = true
  })
}
