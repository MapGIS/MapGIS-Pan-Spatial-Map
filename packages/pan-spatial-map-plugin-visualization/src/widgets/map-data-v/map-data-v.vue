<template>
  <div ref="mapDataV" class="mp-widget-map-data-v">
    <iframe
      v-if="url"
      :src="url"
      frameborder="0"
      width="100%"
      height="100%"
    ></iframe>
    <div class="empty-box" v-else><a-empty /></div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin, DomUtil } from '@mapgis/web-app-framework'

@Component({ name: 'MpMapDataV' })
export default class MpMapDataV extends Mixins(WidgetMixin) {
  get url() {
    return this.widgetInfo.config.url
  }

  onOpen() {
    const el = this.$refs.mapDataV
    if (!DomUtil.inFullScreen(el)) {
      this.$message.warn('对不起，您的浏览器不支持全屏模式')
    }
  }
}
</script>

<style lang="less" scoped>
.mp-widget-map-data-v {
  width: 100%;
  height: 100%;
  .empty-box {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
