<template>
  <mp-app-loader v-if="themeLoaded" :application="application" />
</template>

<script>
import { AppManager, MapRender, baseConfigInstance } from '@mapgis/web-app-framework'
import request from '@/utils/request'
import mapgisui from '@mapgis/webclient-vue-ui'

export default {
  data() {
    return {
      application: {},
      themeLoaded: false
    }
  },
  computed: {},
  async created() {
    await AppManager.getInstance().loadConfig(
      window._CONFIG['domainURL'],
      `${window._CONFIG['apiPathServicesPrefix']}/system/AppResourceServer/app/config`,
      `${window._CONFIG['apiPathServicesPrefix']}/system/AppResourceServer/`,
      request,
      process.env.VUE_APP_CONTEXT_PATH
    )
    this.application = AppManager.getInstance().getApplication()
    console.log('application---------------', this.application)
    /**
     * 修改说明：退出登录，再次进入地图视图界面，这里需要初始化maprender的值
     * 修改人：龚跃健
     * 修改时间：2022/3/25
     */
    const initMode =
      baseConfigInstance.config && baseConfigInstance.config.initMode ? baseConfigInstance.config.initMode : undefined
    if (!initMode || initMode === 'map') {
      this.application.document.maprender = MapRender.MAPBOXGL
    } else if (initMode === 'globe') {
      this.application.document.maprender = MapRender.CESIUM
    }

    const style = this.themeStyle()
    const opacity = this.themeOpacity()
    const payload = {
      opacity: opacity
    }
    mapgisui.setTheme(style.theme, payload)

    // 此处做主题加载判断，判断是否使用public目录下的theme文件夹中的local-theme.config.json文件中的信息配置
    const themeUrl = `${this.application.publicPath}theme/local-theme.config.json`
    const themeConfig = await this.getLocalConfig(themeUrl)

    if (themeConfig) {
      let theme
      if (themeConfig.usage) {
        theme = await this.parseConfig(themeConfig, true, true)
      }

      if (themeConfig.useConfig && !themeConfig.usage) {
        theme = await this.parseConfig(themeConfig, false, true)
      }
      if (theme) {
        const {
          manifest,
          layout: { contentWidgets, mapWidgets }
        } = theme

        if (contentWidgets) {
          this.application.contentWidgets = contentWidgets
        }

        if (mapWidgets) {
          this.application.mapWidgets = mapWidgets
        }

        if (manifest) {
          this.application.theme.manifest = manifest
        }
      }
    }

    // 此处做微件加载判断，判断是否使用public目录下的widgets文件夹中的local-widget.config.json文件中的信息配置
    const widgetUrl = `${this.application.publicPath}widgets/local-widget.config.json`
    const widgetConfig = await this.getLocalConfig(widgetUrl)
    if (widgetConfig) {
      let widget
      if (widgetConfig.usage) {
        widget = await this.parseConfig(widgetConfig, true, false)
      }
      if (widgetConfig.useConfig && !widgetConfig.usage) {
        widget = await this.parseConfig(widgetConfig, false, false)
      }
      if (widget) {
        const { MapgisWidgets, MapgisWidgetsPosition } = widget
        this.parseWidgets(MapgisWidgets, MapgisWidgetsPosition)
      }
    }
    this.themeLoaded = true
  },
  methods: {
    themeStyle() {
      if (this.application.theme) {
        if (this.application.theme.style) {
          if (this.application.theme.manifest) {
            const style = this.application.theme.manifest.styles.find(item => {
              return item.name === this.application.theme.style
            })

            if (style) {
              return {
                color: style.color,
                theme: style.theme
              }
            }
          }
        } else if (this.application.theme.customStyle) {
          return this.application.theme.customStyle
        }
      }
      return { theme: 'dark', color: '#1890ff' }
    },
    themeOpacity() {
      if (this.application.theme) {
        return this.application.theme.opacity || 1
      }
      return 1
    },
    getLocalConfig(url) {
      return new Promise((resolve, reject) => {
        fetch(url)
          .then(res => {
            const conleData = res.clone()
            return conleData.json()
          })
          .then(config => {
            resolve(config)
          })
          .catch(e => {
            resolve(null)
          })
      })
    },
    parseConfig(config, loadScript, isTheme) {
      return new Promise((resolve, reject) => {
        const { MapgisConfigUrl } = config
        this.loadPlugin(MapgisConfigUrl, loadScript, isTheme).then(result => {
          resolve(result)
        })
      })
    },
    loadPlugin(url, loadScript, isTheme) {
      // eslint-disable-next-line promise/param-names
      return new Promise((resole, reject) => {
        fetch(this.application.publicPath + url)
          .then(res => {
            const conleData = res.clone()
            return conleData.json()
          })
          .then(config => {
            const {
              MapgisWindowGlobalVueRuntime = 'MapgisApplicationVueRuntime',
              // eslint-disable-next-line no-unused-vars
              MapgisExportComponentsName,
              MapgisPluginComponentCssUrl,
              MapgisPluginComponentUmdJsUrl,
              MapgisTheme,
              MapgisWidgets,
              MapgisWidgetsPosition
            } = config

            if (!loadScript) {
              resole(isTheme ? MapgisTheme : { MapgisWidgets, MapgisWidgetsPosition })
            } else {
              const pluginCss = document.createElement('style')
              pluginCss.type = 'text/css'
              pluginCss.id = 'plugincss'
              document.getElementsByTagName('head')[0].appendChild(pluginCss)
              const PromiseCss = fetch(`${this.application.publicPath}${MapgisPluginComponentCssUrl}`).then(res =>
                res.text()
              )

              // eslint-disable-next-line promise/param-names
              const PromiseJs = new Promise(res => {
                const scriptPlugin = document.createElement('script')
                document.body.appendChild(scriptPlugin)
                scriptPlugin.src = `${this.application.publicPath}${MapgisPluginComponentUmdJsUrl}`
                // eslint-disable-next-line no-unused-vars
                scriptPlugin.onload = payload => {
                  const Vue = window[`${MapgisWindowGlobalVueRuntime}`]
                  if (!Vue) {
                    const info =
                      '全局Vue运行时没有找到，请保证插件config.json文件中的MapgisWindowGlobalVueRuntime和主应用导出的保持一致'
                    console.warn(info)
                    reject(info)
                  }
                  // window.install(window['MapgisApplicationVueRuntime'], {})

                  // const coms = window[`${MapgisExportComponentsName}`]
                  // for (const name in coms) {
                  //   const com = coms[name]
                  //   Vue.component(com.options ? com.options.name : com.name, com)
                  // }
                  res()
                }
              })

              Promise.all([PromiseCss, PromiseJs]).then(res => {
                // eslint-disable-next-line no-unused-vars
                const [csstext, js] = res
                pluginCss.appendChild(document.createTextNode(csstext))
                resole(isTheme ? MapgisTheme : { MapgisWidgets, MapgisWidgetsPosition })
              })
            }
          })
      })
    },
    parseWidgets(widgetArr, positions) {
      widgetArr.forEach(item => {
        // eslint-disable-next-line no-unused-vars
        const { id, uri } = item
        const widget = positions[id]
        if (!widget) return
        const { position, content, hasGroup, groupName, dropOn } = widget
        const conentWidgets = this.application[position]
        let targetWidgets
        // conentWidgets
        if (conentWidgets.groups) {
          targetWidgets = conentWidgets.groups.find(widgets => widgets.content === content)
          targetWidgets.widgets.push(item)
          targetWidgets.widgetStructure.push({ id })
          const targetWidgetStructure = targetWidgets.widgetStructure.find(structure => structure.label === groupName)
          if (!hasGroup || !targetWidgetStructure) {
            const ungroupedStructure = targetWidgets.widgetStructure.find(structure => structure.label === '未分组')
            if (ungroupedStructure) {
              ungroupedStructure.children.push({ id })
            } else {
              const ungrouped = {
                label: '未分组',
                children: [{ id }]
              }
              targetWidgets.widgetStructure.push(ungrouped)
            }
          }
          if (targetWidgetStructure) {
            targetWidgetStructure.children.push({ id })
          }
        } else {
          // mapWidgets
          // const hasWidgets = conentWidgets.widgets.find(widget => widget.uri === uri)
          // hasWidgets && console.warn(`微件[${item.manifest.name}]已存在,请勿重复添加!!!`)
          // if (!hasWidgets) {
          //   item.position = dropOn
          //   conentWidgets.widgets.push(item)
          // }
          item.position = dropOn
          conentWidgets.widgets = [item]
        }
      })
    }
  }
}
</script>

<style></style>
