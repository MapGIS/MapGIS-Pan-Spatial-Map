<template>
  <mp-app-loader :application="application" />
</template>

<script>
import { AppManager } from '@mapgis/web-app-framework'
import {
  envInstance,
  loadEnv,
  api,
  loadConfigs
} from '@mapgis/pan-spatial-map-store'

export default {
  data() {
    return {
      application: {}
    }
  },
  async created() {
    await loadEnv()

    await loadConfigs()

    const appInfo = await api.getAppInfo()

    await AppManager.getInstance().loadConfig(
      envInstance.config.baseApi,
      appInfo.configPath,
      appInfo.assetsPath
    )

    this.application = AppManager.getInstance().getApplication()

    console.log(this.application)
  }
}
</script>
