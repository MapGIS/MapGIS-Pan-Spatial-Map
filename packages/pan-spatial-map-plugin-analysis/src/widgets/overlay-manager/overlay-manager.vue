<template>
  <div style='height: 900px;width:332px'>
    <mapgis-3d-graphic-layer
      :models='models'
      :dataSource='dataSource'
      @save='save'
    />
  </div>
</template>

<script lang='ts'>
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  LayerType,
  WidgetMixin
} from '@mapgis/web-app-framework'
import {
  eventBus,
  events,
  api
} from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpOverlayManager'
})
export default class MpOverlayAnalysis extends Mixins(WidgetMixin) {
  private dataSource = []

  private models = {}

  async mounted() {
    let config = await api.getWidgetConfig('overlay-manager')
    if (!config) {
      config = {}
    }
    if (typeof config === 'string') {
      config = JSON.parse(config)
    }
    const { dataSource, models } = config
    if (dataSource) {
      const dataSource = config.dataSource
      for (let i = 0; i < dataSource.length; i++) {
        const features = dataSource[i]
        for (let j = 0; j < features.length; j++) {
          const { style } = features[j]
          const { url } = style
          if (url) {
            features[j].style.url = this.baseUrl + url;
          }
        }
      }
    }
    if (models) {
      this.models = config.models
      const vm = this
      Object.keys(vm.models).forEach(function(key) {
        for (let i = 0; i < vm.models[key].length; i++) {
          vm.models[key][i].img = vm.baseUrl + vm.models[key][i].img
          vm.models[key][i].model = vm.baseUrl + vm.models[key][i].model
        }
      })
    }
  }

  save(e) {
    // let config = await api.getWidgetConfig('overlay-manager')
    // if (!config) {
    //   config = {}
    // }
    // config.dataSource = e
    api.saveWidgetConfig({
      name: 'overlay-manage',
      config: '13123123'
    })
  }
}
</script>

<style lang='less' scoped>
</style>
