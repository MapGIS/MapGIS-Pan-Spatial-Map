<template>
  <mapgis-3d-heightlimited
    :models="models"
    :color="color"
     @load='load'>
  </mapgis-3d-heightlimited>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  WidgetMixin,
  LayerType,
  IGSSceneSublayerRenderType,
  LoadStatus,
  Objects
} from '@mapgis/web-app-framework'

@Component({
  name: 'MpHeightLimitedAnalysis'
})
export default class MpHeightLimitedAnalysis extends Mixins(WidgetMixin) {
  // 模型集合
  private models = []

  private color ="#1C9C80"

  // 控高分析对象
  private heightLimitedAnalysis = undefined

  /**
   * 动态获取基础目录树上已勾选的三维模型数据
   */
  @Watch('document', { deep: true, immediate: true })
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
              const { id } = layer.activeScene.sublayers[0]
              // 限高分析暂时只支持模型
              layers.push({
                title: layer.title,
                vueIndex: id,
              })
            }
          }
        }
      })
    this.models = layers
  }

  onActive() {
    this.heightLimitedAnalysis.mount()
  }

  /**
   * 打开模块
   */
  onOpen() {
    this.heightLimitedAnalysis.mount()
  }

  /**
   * 关闭模块
   */
  onClose() {
    this.heightLimitedAnalysis.unmount()
  }

  load(e){
    this.heightLimitedAnalysis = e
  }
}
</script>

<style lang='less' scoped>

</style>
