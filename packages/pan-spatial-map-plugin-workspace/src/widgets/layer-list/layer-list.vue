<template>
  <mp-widget-routers :mode="mode" :widgetRouters.sync="widgetRouters" />
</template>

<script lang="ts">
import {
  Mixins,
  Component,
  Watch,
  Inject,
  ProvideReactive,
  Vue
} from 'vue-property-decorator'
import { WidgetMixin, AppMixin } from '@mapgis/web-app-framework'
import { Empty } from 'ant-design-vue'
import { api, dataCatalogManagerInstance } from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpLayerList'
})
export default class MpLayerList extends Mixins(WidgetMixin) {
  widgetRouters = []

  mode = 'normal'

  created() {
    this.widgetRouters = [
      {
        name: 'MpLayerListContainer',
        props: {
          widgetInfo: this.widgetInfo
        }
      }
    ]
  }

  /**
   * 视图窗口变化
   */
  private onWindowSize(mode: 'max' | 'normal') {
    this.$nextTick(() => {
      this.mode = mode
    })
  }
}
</script>

<style lang="less"></style>
