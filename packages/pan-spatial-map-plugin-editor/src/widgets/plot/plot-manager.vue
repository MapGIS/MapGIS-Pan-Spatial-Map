<template>
  <div style="max-height: 530px" v-if="is2DMapMode">
    <mapgis-2d-plot
      :symbolUrl="symbolUrl"
      :vueKey="vueKey"
      :vueIndex="vueIndex"
      @loaded="e=>plot=e"
      v-if="vueKey && vueIndex && showSymbol"
      :fontUrl="font"
      :baseUrl="font"
    >
      <template #symbol="slotProps">
        <mp-window-wrapper :visible="showSymbol">
          <mp-window
            :visible.sync="showSymbol"
            title="符号库"
            :vertical-offset="52"
            :horizontal-offset="10"
            :width="320"
            :height="550"
            :has-padding="false"
            anchor="top-left"
          >
            <mapgis-ui-plot-symbol
              :data="slotProps.data"
              @click="slotProps.click"
              @search="slotProps.search"
              :baseUrl="slotProps.baseUrl"
            ></mapgis-ui-plot-symbol>
          </mp-window>
        </mp-window-wrapper>
      </template>
    </mapgis-2d-plot>
  </div>
  <div style="max-height: 530px" v-else>
    <mapgis-3d-plot
      :symbolUrl="symbolUrl"
      :vueKey="vueKey"
      :vueIndex="vueIndex"
      @loaded="e=>plot=e"
      v-if="vueKey && vueIndex && showSymbol"
      :fontUrl="font"
      :baseUrl="font"
    >
      <template #symbol="slotProps">
        <mp-window-wrapper :visible="showSymbol">
          <mp-window
            :visible.sync="showSymbol"
            title="符号库"
            :vertical-offset="52"
            :horizontal-offset="10"
            :width="320"
            :height="550"
            :has-padding="false"
            anchor="top-left"
          >
            <mapgis-ui-plot-symbol
              :data="slotProps.data"
              @click="slotProps.click"
              @search="slotProps.search"
              :baseUrl="slotProps.baseUrl"
            ></mapgis-ui-plot-symbol>
          </mp-window>
        </mp-window-wrapper>
      </template>
    </mapgis-3d-plot>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { LayerType, WidgetMixin } from '@mapgis/web-app-framework'
import { eventBus, events, api } from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpPlotManager',
})
export default class MpPlotManager extends Mixins(WidgetMixin) {
  // private plotLayer = []

  public vueIndex = ''

  public vueKey = ''

  private symbolUrl = ''

  private font = ''

  private showSymbol = false

  private firstOpen = true

  private plot = undefined

  // @Watch('document', { immediate: true, deep: true })
  // getScenes() {
  //   if (!this.document) return
  //   this.plotLayer = []
  //   const vm = this
  //   this.document.defaultMap
  //     .clone()
  //     .getFlatLayers()
  //     .forEach((layer) => {
  //       if (layer.type === LayerType.Plot) {
  //         // console.log('plotlayerssssssss', layer)
  //         vm.plotLayer.push(layer.id)
  //       }
  //     })
  // }
  created() {
    this.$root.$on('plot-layer-loaded', this.handleLoad.bind(this))
  }

  onOpen() {
    this.font =  `${process.env.VUE_APP_API_BASE_URL}/upload/`
    this.symbolUrl =  `${process.env.VUE_APP_API_BASE_URL}/upload/标绘/symbols.json`
    this.showSymbol = true
    this.plot && this.plot.setPick();
  }

  onClose() {
    this.showSymbol = false
    const newConfig = this.plot && this.plot.toJSON();
    // console.log('plotConfig',newConfig)
    api.saveConfig({
      name: 'plot',
      config: JSON.parse(JSON.stringify(newConfig)),
    })
  }

  handleLoad(vueIndex, vueKey) {
    this.vueIndex = vueIndex;
    this.vueKey = vueKey;

    // console.log('vueIndex, vueKey', vueIndex, vueKey)
  }
}
</script>

<style lang="less" scoped></style>
