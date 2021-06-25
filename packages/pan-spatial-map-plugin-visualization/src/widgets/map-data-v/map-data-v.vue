<template>
  <div class="mp-widget-map-data-v">
    <iframe
      id="iframe_page"
      src="http://datav.jiaminghi.com/demo/construction-data/index.html"
      frameborder="0"
      width="100%"
      height="100%"
      :allowfullscreen="true"
    ></iframe>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpMapDataV' })
export default class MpMapDataV extends Mixins(WidgetMixin) {
  onOpen() {
    const page = document.getElementById('iframe_page')
    page.requestFullscreen()
  }
}
</script>

<style lang="less" scoped>
.mp-widget-map-data-v {
  width: 100%;
  height: 100%;
}
</style>
