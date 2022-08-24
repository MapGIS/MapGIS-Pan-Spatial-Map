<template>
  <div style="max-height: 530px" v-if="is2DMapMode">
    <mapgis-2d-plot-animation
      :data="data"
      :vueKey="vueKey"
      :vueIndex="vueIndex"
      v-if="dataLoaded"
      @loaded="(e) => (animation = e)"
      @export="saveConfig"
      @play="timelinePlay"
      @reset="timelineReset"
    >
      <template #timeline="slotProps" v-if="is2DMapMode">
        <mp-window-wrapper :visible="showTimeline">
          <mp-placement
            :position="'bottom-left'"
            v-show="showTimeline"
            :offset="[52, 60]"
            style="right: 0px"
          >
            <mapgis-ui-plot-timeline
              ref="timeline"
              :value="slotProps.value"
              :min="slotProps.min"
              :max="slotProps.max"
              @change="slotProps.change"
              :enableEnd="slotProps.enableEnd"
              :speed="slotProps.speed"
              :interval="slotProps.interval"
              :intervalOptions="slotProps.intervalOptions"
              :duration="slotProps.duration"
              @start="slotProps.start"
              @backward="slotProps.backward"
              @pause="slotProps.pause"
              @forward="slotProps.forward"
              @speedChange="slotProps.speedChange"
              @intervalChange="slotProps.intervalChange"
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
      v-if="dataLoaded"
      @loaded="(e) => (animation = e)"
      @export="saveConfig"
      @play="timelinePlay"
      @reset="timelineReset"
    >
      <template #timeline="slotProps" v-if="!is2DMapMode">
        <mp-window-wrapper :visible="showTimeline">
          <mp-placement
            :position="'bottom-left'"
            v-show="showTimeline"
            :offset="[52, 60]"
            style="right: 0px"
          >
            <mapgis-ui-plot-timeline
              ref="timeline"
              :value="slotProps.value"
              :min="slotProps.min"
              :max="slotProps.max"
              @change="slotProps.change"
              :enableEnd="slotProps.enableEnd"
              :speed="slotProps.speed"
              :interval="slotProps.interval"
              :intervalOptions="slotProps.intervalOptions"
              :duration="slotProps.duration"
              @start="slotProps.start"
              @backward="slotProps.backward"
              @pause="slotProps.pause"
              @forward="slotProps.forward"
              @speedChange="slotProps.speedChange"
              @intervalChange="slotProps.intervalChange"
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
  name: 'MpPlotAnimation'
})
export default class MpPlotAnimation extends Mixins(WidgetMixin) {
  public vueIndex = ''

  public vueKey = ''

  private data = ''

  private dataLoaded = false

  private showTimeline = false

  private animation = undefined

  async created() {
    const config = await api.getWidgetConfig('plot-animation')
    // console.log('plot-animation-config', config)
    this.data = JSON.parse(JSON.stringify(config))

    this.$root.$on(events.PLOT_LAYER_LOADED, this.handleLoad.bind(this))
  }

  onOpen() {
    this.showTimeline = true
    this.animation && this.animation.setPick()
  }

  onClose() {
    this.showTimeline = false
  }

  handleLoad(vueIndex, vueKey) {
    this.vueIndex = vueIndex
    this.vueKey = vueKey
    this.dataLoaded = true
    // console.log('vueIndex, vueKey---animation', vueIndex, vueKey)
  }

  saveConfig(newConfig) {
    // console.log('plotANIMATIONConfig', newConfig)
    api.saveWidgetConfig({
      name: 'plot-animation',
      config: JSON.parse(JSON.stringify(newConfig))
    })
  }

  timelineReset() {
    this.$refs.timeline.stopPlay()
  }

  timelinePlay() {
    this.$refs.timeline.getWindowWidth()
    this.$refs.timeline.forward()
  }
}
</script>

<style lang="less" scoped></style>
