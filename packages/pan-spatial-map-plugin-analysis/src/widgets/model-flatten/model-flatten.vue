<template>
  <div style='height: 500px;width:332px'>
    <mapgis-3d-model-flatten />
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
  name: 'MpModelFlatten'
})
export default class MpOverlayAnalysis extends Mixins(WidgetMixin) {
  mounted() {
  }
}
</script>

<style lang='less' scoped>
</style>
