<template>
  <div style='height: 210px;width:280px'>
    <mapgis-3d-model-flatten :M3Ds='M3Ds' :heightOffset='heightOffset'/>
  </div>
</template>

<script lang='ts'>
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  LayerType,
  WidgetMixin
} from '@mapgis/web-app-framework'
import {
  dataCatalogManagerInstance,
  eventBus,
  events
} from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpModelFlatten'
})
export default class MpOverlayAnalysis extends Mixins(WidgetMixin) {
  private M3Ds = []

  private heightOffset = -2

  @Watch('document', { immediate: true, deep: true })
  getScenes() {
    if (!this.document) return
    this.M3Ds = [];
    const vm = this;
    this.document.defaultMap
      .clone()
      .getFlatLayers()
      .forEach((layer, index) => {
        if(layer.type === 22){
          vm.M3Ds.push({
            key: layer.id,
            value: layer.title
          });
        }
      })
  }
}
</script>

<style lang='less' scoped>
</style>
