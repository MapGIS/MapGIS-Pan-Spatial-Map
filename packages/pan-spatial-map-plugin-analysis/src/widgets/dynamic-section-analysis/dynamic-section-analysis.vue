<template>
  <div class="mp-widget-dynamic-section-analysis">
    <mapgis-3d-dynamic-section ref="dynamicSection" :models="models" />
  </div>
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
  name: 'MpDynamicSectionAnalysis'
})
export default class MpDynamicSectionAnalysis extends Mixins(WidgetMixin) {
  // 模型集合
  private models = []

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
              const { id, range } = layer.activeScene.sublayers[0]
              // 剖切分析暂时只支持模型
              layers.push({
                title: layer.title,
                vueIndex: id,
                range
              })
            }
          }
        }
      })
    this.models = layers
  }

  /**
   * 打开模块
   */
  onOpen() {
    this.$refs.dynamicSection?.onOpen()
  }

  /**
   * 关闭模块
   */
  onClose() {
    this.$refs.dynamicSection?.onClose()
    this.$refs.dynamicSection?.unmount()
  }
}
</script>

<style lang="less" scoped>
@import '../index.less';

::v-deep {
  .ant-input-number {
    width: 100%;
  }
}

.mp-widget-dynamic-section-analysis {
  display: flex;
  flex-direction: column;
  .model,
  .axis {
    font-size: 12px;
    .ant-radio-wrapper {
      font-size: 12px;
    }
  }
}
</style>
