<template>
  <mapgis-3d-ponding-simulation @loaded="loaded"></mapgis-3d-ponding-simulation>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpPondingSimulation'
})
export default class MpPondingSimulation extends Mixins(WidgetMixin) {
  
  /**
   * 微件打开时
   */
  onOpen() {
    this.ponding.mounted()
  }

  /**
   * 微件关闭时
   */
  onClose() {
    this.ponding.destroyed()
  }

  loaded(ponding) {
    this.ponding = ponding
  }
}
</script>

<style lang="less" scoped></style>
