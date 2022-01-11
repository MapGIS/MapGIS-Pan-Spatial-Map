<template>
  <div style='height: 176px;width:332px'>
    <mapgis-3d-model-flatten :M3Ds='M3Ds'/>
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

  async mounted() {
    const dataCatalogTreeData = await dataCatalogManagerInstance.getDataCatalogTreeData()
    for (let i = 0; i < dataCatalogTreeData.length; i++) {
      const children1 = dataCatalogTreeData[i].children
      if (children1) {
        for (let j = 0; j < children1.length; j++) {
          const { serverType } = children1[j];
          if(serverType === 22){
            this.M3Ds.push(children1[j]);
          }
          const children2 = children1[j].children
          if (children2) {
            for (let k = 0; k < children2.length; k++) {
              const { serverType } = children2[k];
              if(serverType === 22){
                this.M3Ds.push(children2[k]);
              }
              const children3 = children2[k].children
              if (children3) {
                for (let m = 0; m < children3.length; m++) {
                  const { serverType } = children3[m];
                  if(serverType === 22){
                    this.M3Ds.push(children3[m]);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</script>

<style lang='less' scoped>
</style>
