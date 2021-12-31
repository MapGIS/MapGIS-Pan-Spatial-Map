<template>
    <mapgis-3d-stratified-household
      v-if="show"
      @loaded="load"
      :outStyle="outStyle"
      :layers="layers"
      :enableCollapse="false"
      :enableStratifiedHouse="true"
    ></mapgis-3d-stratified-household>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { 
  WidgetMixin,
  LayerType,
  IGSSceneSublayerRenderType,
  LoadStatus,
} from '@mapgis/web-app-framework'

@Component({
  name: 'MpStratifiedHousehold',
})
export default class MpStratifiedHousehold extends Mixins(WidgetMixin) {
  outStyle = {
    position: 'absolute',
    // position: 'relative',
    zIndex: 1000,
    padding: '0px',
    margin: '0px',
    height: '460px',
    width: '270px',
    top: '0px',
    left: '0px',
  }

  layers = [];
  
  show = true;

 /**
   * 动态获取基础目录树上已勾选的三维模型数据
   */
  @Watch('document', { immediate: true, deep: true })
  getScenes() {
    if (!this.document) return
    const layers = []
    this.document.defaultMap
      .clone()
      .getFlatLayers()
      .forEach((layer, index) => {
        if (layer.loadStatus === LoadStatus.loaded) {
          if (layer.type === LayerType.IGSScene) {
            const { renderType } = layer.activeScene.sublayers[0]
            if (renderType === IGSSceneSublayerRenderType.modelCache) {
              const { range } = layer.activeScene.sublayers[0]
              const { id } = layer.activeScene.layer
              let isHousehold;
              if (layer.title.indexOf('G3D') >= 0) {
                isHousehold = true;
              } else {
                isHousehold = false;
              }
              // 剖切分析暂时只支持模型
              layers.push({
                title: layer.title,
                vueIndex: id,
                range,
                isHousehold
              })
            }
          }
        }
      })
    this.layers = layers;
    console.log('layers', layers);
  }

  /**
   * 微件打开时
   */
  onOpen() {
    this.show = true
  }

  /**
   * 微件关闭时
   */
  onClose() {
    this.show = false  
  }

  load(payload) {
    const { component } = payload
    this.component = component
  }
}
</script>

<style lang="less" scoped>
  .mapgis-3d-stratified-household-wrapper {
    height: 450px;
    width: 260px;
  }
</style>
