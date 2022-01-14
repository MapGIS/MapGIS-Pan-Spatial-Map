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
  getWidgetConfig,
  saveWidgetConfig
} from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpOverlayManager'
})
export default class MpOverlayAnalysis extends Mixins(WidgetMixin) {
  private dataSource = []

  private models = {}

  mounted() {
    this.models = this.widgetInfo.config.models
    const vm = this
    Object.keys(vm.models).forEach(function(key) {
      for (let i = 0; i < vm.models[key].length; i++) {
        vm.models[key][i].img = vm.baseUrl + vm.models[key][i].img
        vm.models[key][i].model = vm.baseUrl + vm.models[key][i].model
      }
    })
    // this.dataSource = getWidgetConfig('overlay-manager')
    // this.dataSource = [
    //   {"name":"图层_1","uuid":5819856,"autoFlyTo":true,"autoFlyToGraphic":true,"camera":{"positionCartographic":{"height":222159.63122997925,"longitude":2.021214435128474,"latitude":0.692692489461793},"heading":6.283185307179586,"pitch":-1.5696740212653086,"roll":0},"dataSource":{"type":"FeatureCollection","features":[{"type":"rectangle","id":"016abbff-51b9-4394-8d7d-6f66c09ea7c1","positions":[-2112808.108161033,4413990.7152169645,4076926.7214708636,-2128295.7558298414,4418220.677384785,4064354.863683416],"style":{"height":0,"color":[0.9411764705882353,0.2549019607843137,0.3333333333333333,1],"depthTest":false,"vertexFormat":[1,1,1,0,0,0]},"editPointStyle":{"outlineColor":[1,0.9607843137254902,0.9333333333333333,0.9],"color":[1,0,0,1],"centerPointColor":[0.41568627450980394,0.35294117647058826,0.803921568627451,0.9],"pixelSize":25,"insertPointColor":{"red":0.9568627450980393,"green":0.6431372549019608,"blue":0.3764705882352941,"alpha":0.6},"highLightColor":{"red":0.5294117647058824,"green":0.807843137254902,"blue":0.9215686274509803,"alpha":0.8}},"attributes":{"title":"矩形_1"},"show":true,"allowPicking":true,"modelMatrix":{"0":-0.9019934868858138,"1":-0.43174963765540225,"2":0,"3":0,"4":0.2774568178886412,"5":-0.5796513090008989,"6":0.7661736579788254,"7":0,"8":-0.33079519921347195,"9":0.6910836493203797,"10":0.642633585972089,"11":0,"12":-2120554.8135698014,"13":4416111.697255987,"14":4070646.3613667507,"15":1},"asynchronous":false}]}},
    //   {"name":"图层_2","uuid":1821594,"autoFlyTo":true,"autoFlyToGraphic":true,"camera":{"positionCartographic":{"height":140996.1126523773,"longitude":2.0277251539980545,"latitude":0.6921663434339077},"heading":6.283185307179585,"pitch":-1.5696757778703887,"roll":0},"dataSource":{"type":"FeatureCollection","features":[{"type":"rectangle","id":"9b545c87-3a93-4b32-90c9-bba6f1f213c8","positions":[-2166108.814730466,4406380.127233748,4057274.493084703,-2181188.645738132,4406917.493409031,4048660.6752181817],"style":{"height":0,"color":[0.9411764705882353,0.2549019607843137,0.3333333333333333,1],"depthTest":false,"vertexFormat":[1,1,1,0,0,0]},"editPointStyle":{"outlineColor":[1,0.9607843137254902,0.9333333333333333,0.9],"color":[1,0,0,1],"centerPointColor":[0.41568627450980394,0.35294117647058826,0.803921568627451,0.9],"pixelSize":25,"insertPointColor":{"red":0.9568627450980393,"green":0.6431372549019608,"blue":0.3764705882352941,"alpha":0.6},"highLightColor":{"red":0.5294117647058824,"green":0.807843137254902,"blue":0.9215686274509803,"alpha":0.8}},"attributes":{"title":"矩形_1"},"show":true,"allowPicking":true,"modelMatrix":{"0":-0.8973912665108771,"1":-0.4412356680845328,"2":0,"3":0,"4":0.2821843485663468,"5":-0.5739104706761523,"6":0.7687644405619083,"7":0,"8":-0.3392062915309657,"9":0.6898824949643767,"10":0.6395320437065966,"11":0,"12":-2173650.7593102464,"13":4406652.923877081,"14":4052971.393048025,"15":1},"asynchronous":false}]}}
    // ]
  }

  save(e) {
    // saveWidgetConfig('overlay-manager', e)
  }
}
</script>

<style lang='less' scoped>
</style>
