<template>
  <div style='height: 900px;width:332px'>
    <mapgis-3d-graphic-layer :models='models' :dataSource='dataSource' />
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
  events
} from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpOverlayManager'
})
export default class MpOverlayAnalysis extends Mixins(WidgetMixin) {
  private dataSource = []

  private models = {}

  mounted() {
    this.models = this.widgetInfo.config.models;
    const vm = this;
    Object.keys(vm.models).forEach(function(key) {
      for (let i = 0; i < vm.models[key].length; i++) {
        vm.models[key][i].img = vm.baseUrl + vm.models[key][i].img;
        vm.models[key][i].model = vm.baseUrl + vm.models[key][i].model;
      }
    })
  }
}
</script>

<style lang='less' scoped>
</style>
