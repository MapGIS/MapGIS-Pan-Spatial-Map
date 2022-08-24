<template>
  <mapgis-3d-scene-setting
    @loaded="loaded"
    :initialStatebar="initialStatebar"
    :initParams="config"
    ref="sceneSetting"
  >
  </mapgis-3d-scene-setting>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { api } from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpSceneSetting'
})
export default class MpSceneSetting extends Mixins(WidgetMixin) {
  // 页面布局方式
  private layout = 'horizontal'

  private initialStatebar = true

  get config() {
    return this.widgetInfo.config
  }

  /**
   * 微件打开时
   */
  onOpen() {
    this.setting.mount()
  }

  /**
   * 微件关闭时
   */
  onClose() {
    this.setting.unmount()
    this.saveConfig()
  }

  // 微件失活时
  onDeActive() {
    this.saveConfig()
  }

  loaded(setting) {
    this.setting = setting
  }

  saveConfig() {
    const {
      initBasicSetting,
      initCameraSetting,
      initLightSetting,
      initWeatherSetting,
      initEffectSetting
    } = this.$refs.sceneSetting
    const config = {
      basicSetting: initBasicSetting,
      cameraSetting: initCameraSetting,
      lightSetting: initLightSetting,
      weatherSetting: initWeatherSetting,
      effectSetting: initEffectSetting
    }
    console.log(config)
    api
      .saveWidgetConfig({
        name: 'scene-setting',
        config: JSON.stringify(config)
      })
      .then(() => {
        // this.$message.success('更新场景设置配置成功')
        // console.log('更新场景设置配置成功')
      })
      .catch(() => {
        // this.$message.error('更新场景设置配置失败')
        // console.log('更新场景设置配置失败')
      })
  }
}
</script>

<style lang="less" scoped></style>
