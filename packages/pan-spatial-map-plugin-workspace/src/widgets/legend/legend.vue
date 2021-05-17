<template>
  <div class="mp-widget-legend">
    图例
    <MpWindowWrapper>
      <MpWindow></MpWindow>
    </MpWindowWrapper>
    <mp-map-widget-button :widget="widget" @click="onClickWidget" />
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import {
  dataCatalogInstance,
  eventBus,
  api,
  envInstance
} from '@mapgis/pan-spatial-map-store'

@Component({ name: 'MpLegend' })
export default class MpLegend extends Mixins(WidgetMixin) {
  // 图例微件的显隐
  private visible = false

  created() {
    console.log(this.widgetInfo.config)
    eventBus.$on('uploader-success', this.onGetConfig)
  }

  private onClickWidget() {}

  onGetConfig() {}
}
</script>

<style lang="less" scoped></style>
