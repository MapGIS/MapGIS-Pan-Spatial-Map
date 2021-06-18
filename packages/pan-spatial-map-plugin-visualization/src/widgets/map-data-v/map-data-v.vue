<template>
  <div class="mp-widget-map-data-v">
    <iframe
      src="http://localhost:8016/BigData#/sharedProjectSource"
      frameborder="0"
      width="100%"
      height="100%"
    ></iframe>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpMapDataV' })
export default class MpMapDataV extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped>
.mp-widget-map-data-v {
  width: 100%;
  height: 100%;
}
</style>
