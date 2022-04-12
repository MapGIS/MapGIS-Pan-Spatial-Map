<template>
  <div style="max-height: 530px">
    <mapgis-3d-graphic-layer
      :models="models"
      :dataSource="dataSource"
      @save="save"
      ref="graphicLayer"
    />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch, Provide } from 'vue-property-decorator'
import { LayerType, WidgetMixin } from '@mapgis/web-app-framework'
import { eventBus, events, api } from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpOverlayManager',
})
export default class MpOverlayAnalysis extends Mixins(WidgetMixin) {
  @Provide()
  get uploadUrl() {
    return `${this.baseUrl}/api/local-storage/pictures`
  }

  private dataSource = []

  private models = {}

  private firstOpen = true

  async mounted() {
    let config = await api.getWidgetConfig('overlay-manager')
    if (!config) {
      config = {}
    }
    const { models } = config
    if (models) {
      this.models = config.models
      const vm = this
      Object.keys(vm.models).forEach(function (key) {
        for (let i = 0; i < vm.models[key].length; i++) {
          vm.models[key][i].img = vm.baseUrl + vm.models[key][i].img
          vm.models[key][i].model = vm.baseUrl + vm.models[key][i].model
        }
      })
    }
  }

  async onOpen() {
    if (this.firstOpen) {
      let config = await api.getWidgetConfig('overlay-manager')
      if (!config) {
        config = {}
      }
      const { dataSource } = config
      if (dataSource) {
        const dataSource = config.dataSource
        for (let i = 0; i < dataSource.length; i++) {
          const features = dataSource[i]
          for (let j = 0; j < features.length; j++) {
            const { style } = features[j]
            const { url } = style
            if (url) {
              features[j].style.url = this.baseUrl + url
            }
          }
        }
      }
      this.firstOpen = false
      this.dataSource = dataSource
    } else {
      this.$refs.graphicLayer.$_showCurrentGraphic()
    }
  }

  onClose() {
    this.$refs.graphicLayer.$_hideAllGraphic()
  }

  async save(e) {
    let config = await api.getWidgetConfig('overlay-manager')
    if (!config) {
      config = {}
    }
    config.dataSource = e
    api.saveWidgetConfig({
      name: 'overlay-manager',
      config: config,
    })
  }
}
</script>

<style lang="less" scoped></style>
