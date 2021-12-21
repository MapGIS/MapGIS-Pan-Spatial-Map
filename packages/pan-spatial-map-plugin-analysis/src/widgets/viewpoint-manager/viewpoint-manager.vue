<template>
  <mapgis-3d-viewpoint-manager @loaded="loaded"></mapgis-3d-viewpoint-manager>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpViewpointManager'
})
export default class MpViewpointManager extends Mixins(WidgetMixin) {
  
  /**
   * 微件打开时
   */
  onOpen() {
    this.viewpoint.mount()
  }

  /**
   * 微件关闭时
   */
  onClose() {
    this.viewpoint.unmount()
  }

  loaded(viewpoint) {
    this.viewpoint = viewpoint
  }
}
</script>

<style lang="less" scoped></style>
