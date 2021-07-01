<template>
  <div class="mp-tree-select">
    <div class="setting-panel">
      <a-space
        direction="vertical"
        class="space"
        v-if="layers && layers.length > 0"
      >
        <a-row>
          <a-col :span="6" class="col">选择数据</a-col>
          <a-col :span="18">
            <a-select v-model="layerIndex" style="width:100%">
              <a-select-option v-for="(item, index) in layers" :key="index">{{
                item.title
              }}</a-select-option>
            </a-select>
          </a-col>
        </a-row>
        <a-row v-if="isDoc(layers[layerIndex])">
          <a-col :span="6" class="col">选择图层</a-col>
          <a-col :span="18">
            <a-select v-model="subLayerIndex" style="width:100%">
              <a-select-option
                v-for="(item, index) in layers[layerIndex].sublayers"
                :key="index"
                >{{ item.title }}</a-select-option
              >
            </a-select>
          </a-col>
        </a-row>
        <a-row>
          <a-button type="primary" @click="sureData" style="float:right">
            确定
          </a-button>
        </a-row>
      </a-space>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin, LoadStatus, LayerType } from '@mapgis/web-app-framework'

@Component({ name: 'MpTreeSelect' })
export default class MpTreeSelect extends Mixins(WidgetMixin) {
  // 基础目录树上已选择的数据
  private layers = []

  private layerIndex = 0

  private subLayerIndex = 0

  // 判断图层是不是IGServer地图文档
  isDoc(layer) {
    return layer.type === LayerType.IGSMapImage
  }

  /**
   * 动态获取基础目录树上已勾选的IGServer二维矢量地图文档/图层
   */
  @Watch('document', { deep: true, immediate: true })
  getLayers() {
    if (!this.document) return
    const layers = []
    this.document.defaultMap
      .clone()
      .getFlatLayers()
      .forEach((layer, index) => {
        if (layer.loadStatus === LoadStatus.loaded) {
          if (
            layer.type === LayerType.IGSMapImage ||
            layer.type === LayerType.IGSVector
          ) {
            layers.push(layer)
          }
        }
      })
    this.layers = layers
  }

  sureData() {
    let selectedLayer = {}
    if (this.isDoc(this.layers[this.layerIndex])) {
      selectedLayer = this.layers[this.layerIndex].sublayers[this.subLayerIndex]
    } else {
      selectedLayer = this.layers[this.layerIndex]
    }
    // 只需要提供gdbp地址
    this.$emit('selectedLayer', selectedLayer.url)
  }
}
</script>

<style lang="less" scoped>
.mp-tree-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  .title {
    .space {
      width: 4px;
      height: 25px;
      background: @primary-color;
      margin-right: 8px;
      float: left;
    }
    .label {
      line-height: 25px;
      font-weight: bold;
    }
  }
  .space {
    width: 100%;
  }
  .btn {
    text-align: right;
    margin: 12px 0;
    button {
      margin-left: 8px;
    }
  }
  .col {
    text-align: center;
    line-height: 30px;
  }
  .setting-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    .ant-divider-horizontal {
      margin: 8px 0;
    }
    .color {
      height: 30px;
      box-shadow: @shadow-1-down;
      border-radius: 3px;
    }
  }
  .ant-table-wrapper {
    width: 500px;
  }
}
</style>
