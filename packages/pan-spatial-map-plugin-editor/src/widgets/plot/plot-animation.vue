<template>
  <div style="max-height: 530px" v-if="is2DMapMode">
    <mapgis-2d-plot-animation
      :data="data"
      :vueKey="vueKey"
      :vueIndex="vueIndex"
      v-if="vueKey && vueIndex && data"
      @loaded="(e) => (animation = e)"
      @export="saveConfig"
    >
      <template #timeline="slotProps">
        <mp-window-wrapper :visible="showTimeline">
          <mp-placement
            :position="'bottom-left'"
            v-show="showTimeline"
            :offset="[52, 60]"
            style="right: 0px"
          >
            <mapgis-ui-plot-timeline
              :value="slotProps.value"
              @change="slotProps.change"
              :forwardActive="slotProps.forwardActive"
              :duration="10"
              @start="slotProps.start"
              @backward="slotProps.backward"
              @pause="slotProps.pause"
              @forward="slotProps.forward"
              @end="slotProps.end"
              @speedChange="slotProps.speedChange"
            ></mapgis-ui-plot-timeline>
          </mp-placement>
        </mp-window-wrapper>
      </template>
    </mapgis-2d-plot-animation>
  </div>
  <div style="max-height: 530px" v-else>
    <mapgis-3d-plot-animation
      :data="data"
      :vueKey="vueKey"
      :vueIndex="vueIndex"
      v-if="vueKey && vueIndex && data"
      @loaded="(e) => (animation = e)"
      @export="saveConfig"
    >
      <template #timeline="slotProps">
        <mp-window-wrapper :visible="showTimeline">
          <mp-placement
            :position="'bottom-left'"
            v-show="showTimeline"
            :offset="[52, 60]"
            style="right: 0px"
          >
            <mapgis-ui-plot-timeline
              :value="slotProps.value"
              @change="slotProps.change"
              :forwardActive="slotProps.forwardActive"
              :duration="10"
              @start="slotProps.start"
              @backward="slotProps.backward"
              @pause="slotProps.pause"
              @forward="slotProps.forward"
              @end="slotProps.end"
              @speedChange="slotProps.speedChange"
            ></mapgis-ui-plot-timeline>
          </mp-placement>
        </mp-window-wrapper>
      </template>
    </mapgis-3d-plot-animation>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { SymbolManager } from '@mapgis/webclient-es6-service'
import { LayerType, WidgetMixin } from '@mapgis/web-app-framework'
import { eventBus, events, api } from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpPlotAnimation',
})
export default class MpPlotAnimation extends Mixins(WidgetMixin) {
  public vueIndex = ''

  public vueKey = ''

  private symbolUrl = `${this.baseUrl}/upload/标绘/symbols.json`

  private showSymbol = false

  private data = {}

  private showTimeline = false

  private animation = undefined

  created() {
    this.$root.$on(events.PLOT_LAYER_LOADED, this.handleLoad.bind(this))
  }

  async mounted() {
    const config = await api.getWidgetConfig('plot-animation')
    this.data = JSON.parse(JSON.stringify(config))
    // console.log('plot-animation-config',config)
  }

  onOpen() {
    // this.plot.mount()
    this.showSymbol = true
    this.showTimeline = true
    this.animation && this.animation.setPick()
  }

  onClose() {
    this.showSymbol = false
    this.showTimeline = false
  }

  handleLoad(vueIndex, vueKey) {
    const vm = this
    const manager = new SymbolManager(this.symbolUrl)
    manager.getSymbols().then(function () {
      vm.vueIndex = vueIndex
      vm.vueKey = vueKey
      // console.log('vueIndex, vueKey---animation', vueIndex, vueKey)
    })
  }

  saveConfig(newConfig) {
    // console.log('plotANIMATIONConfig', newConfig)
    api.saveWidgetConfig({
      name: 'plot-animation',
      config: JSON.parse(JSON.stringify(newConfig)),
    })
  }
}
</script>

<style lang="less" scoped></style>
