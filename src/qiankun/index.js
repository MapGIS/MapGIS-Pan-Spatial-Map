import { registerMicroApps, start, addGlobalUncaughtErrorHandler } from 'qiankun'
import { message } from 'ant-design-vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import { getProps } from './state'

/**
 * 微应用注册
 */
function microAppRegister(vm) {
  if (window.isQiankunStart) {
    return
  }

  window.isQiankunStart = true

  const apps = vm.$store.getters['microApps']

  const mainLifeCycles = {
    beforeLoad: [
      app => {
        console.log('[LifeCycle] before load %c%s', 'color: green;', app.name)
        NProgress.start()
      }
    ],
    beforeMount: [
      async app => {
        console.log('[LifeCycle] before mount %c%s', 'color: green;', app.name)
        await vm.$store.dispatch('beforeMount')
      }
    ],
    afterMount: [
      app => {
        console.log('[LifeCycle] after mount %c%s', 'color: red;', app.name)
        NProgress.done()
      }
    ],
    afterUnmount: [
      async app => {
        console.log('[LifeCycle] after unmount %c%s', 'color: green;', app.name)
        await vm.$store.dispatch('afterUnmount')
      }
    ]
  }

  registerMicroApps(
    apps.map(app => {
      const realApp = {
        name: app.name,
        entry: app.entry,
        container: '#micro-page',
        activeRule: app.activeRule,
        props: getProps()
      }
      return realApp
    }),
    mainLifeCycles
  )

  addGlobalUncaughtErrorHandler(event => {
    const { message: msg } = event
    console.log(event)
    if (msg && msg.includes('died in status LOADING_SOURCE_CODE')) {
      message.error('微应用加载失败')
    }
  })

  start({ prefetch: true, singular: true })
}

export default microAppRegister
