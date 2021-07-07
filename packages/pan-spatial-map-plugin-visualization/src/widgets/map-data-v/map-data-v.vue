<template>
  <div class="mp-widget-map-data-v">
    <iframe
      id="iframe_page"
      :src="url"
      frameborder="0"
      width="100%"
      height="100%"
      :allowfullscreen="true"
    ></iframe>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin, DomUtil } from '@mapgis/web-app-framework'
import func from 'app/vue-temp/vue-editor-bridge'

@Component({ name: 'MpMapDataV' })
export default class MpMapDataV extends Mixins(WidgetMixin) {
  get url() {
    return this.widgetInfo.config.url
  }

  onOpen() {
    const page = document.getElementsByClassName('mp-widget-map-data-v')[0]
    DomUtil.inFullScreen(page)
    window.addEventListener('keydown', e => {
      if (e && e.keyCode === 122) {
        e.preventDefault()
        e.stopPropagation()
        DomUtil.inFullScreen(page)
      }
    })
  }
}
</script>

<style lang="less" scoped>
.mp-widget-map-data-v {
  width: 100%;
  height: 100%;
}
</style>
