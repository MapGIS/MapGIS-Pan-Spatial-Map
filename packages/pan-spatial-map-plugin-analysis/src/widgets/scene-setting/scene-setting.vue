<template>
  <mapgis-3d-scene-setting @load="load"></mapgis-3d-scene-setting>
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
  }

  load(setting) {
    this.setting = setting
  }
}
</script>

<style lang="less" scoped></style>
