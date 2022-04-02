<template>
  <mapgis-3d-bim-component
    v-if="show"
    @loaded="load"
    :outStyle="outStyle"
    :layers="layers"
    :enableCollapse="false"
    :enableBim="true"
    :enablePopup="true"
  ></mapgis-3d-bim-component>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin, LayerType, LoadStatus } from '@mapgis/web-app-framework'

@Component({
  name: 'MpBimComponent'
})
export default class MpStratifiedHousehold extends Mixins(WidgetMixin) {
  outStyle = {
    position: 'absolute',
    // position: 'relative',
    zIndex: 1000,
    padding: '0px',
    margin: '0px',
    height: '460px',
    width: '400px',
    top: '0px',
    left: '0px'
  }

  layers = []

  show = true

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
          if (layer.type === LayerType.ModelCache) {
            const { title, id } = layer
            layers.push({ title, vueIndex: id, isBim: true })
          }
        }
      })
    this.layers = layers
  }

  /**
   * 微件打开时
   */
  onOpen() {
    // this.component.mount()
    this.show = true
  }

  /**
   * 微件关闭时
   */
  onClose() {
    // this.component.unmount()
    this.show = false
  }

  load(payload) {
    const { component } = payload
    this.component = component
  }
}
</script>

<style lang="less">
.mapgis-3d-bim-component-wrapper {
  height: 450px;
  width: 400px;
  .mapgis-3d-bim-component {
    width: 400px;
  }
}
</style>
