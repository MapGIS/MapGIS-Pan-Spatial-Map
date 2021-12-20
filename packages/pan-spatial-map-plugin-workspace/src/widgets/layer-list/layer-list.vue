<template>
  <div class="layer-list-router-container">
    <div id="layerListEl">
      <!-- <mp-widget-routers :mode="mode" :widgetRouters.sync="widgetRouters" /> -->
      <mp-file-preview />
    </div>
  </div>
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
        title: '图层树',
        component: 'MpLayerListContainer',
        props: {
          widgetInfo: this.widgetInfo
        }
      }
    ]
  }

  mounted() {
    const url = 'http://192.168.10.214:6163/igs/rest/mrfs/docs/SZ'
    const options = {
      autoReset: true,
      cityGrow: true,
      getDocLayerIndexes: function(indexs) {
        const layerIndex = indexs[0]
        // console.log(layerIndex);
        const layer = this.viewer.scene.layers.getLayer(layerIndex)
        // console.log(layer);
        const timeLineOptions = {
          timeField: 'startTime',
          startColor: new this.Cesium.Color(
            51 / 255.0,
            174 / 255.0,
            204 / 255.0,
            1.0
          ),
          endColor: new this.Cesium.Color(
            215 / 255.0,
            104 / 255.0,
            134 / 255.0,
            1.0
          ),
          buildingsLimit: 100,
          updateInterval: 0.5
        }
        layer.cityGrow(timeLineOptions)
      },
      style: {
        type: 'building',
        styleOptions: {
          heightField: 'height'
        }
      }
    }
    options.url = url
    this.viewer.scene.layers.appendVectorLayer(url, options)
  }

  /**
   * 视图窗口变化
   */
  private onWindowSize(mode: 'max' | 'normal') {
    this.$nextTick(() => {
      this.mode = mode
      const layerListEl = document.getElementById('layerListEl')
      console.log(mode)
      if (layerListEl) {
        layerListEl.style.width = `${
          mode === 'max' ? this.$el.clientWidth : 600
        }px`
      }
    })
  }
}
</script>

<style lang="less" scoped>
#layerListEl {
  width: 600px;
}
</style>
