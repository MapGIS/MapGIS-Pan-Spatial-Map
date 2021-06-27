<template>
  <div class="mp-widget-topology-analysis">
    <a-spin :spinning="showLoading">
      <a-form layout="vertical">
        <a-form-item label="选择参照要素(区要素)">
          <a-select v-model="layerSelectIndex" @change="setNetWorkLayer">
            <a-select-option
              v-for="(item, index) in layerArrOption"
              :key="index"
              :value="index"
            >
              {{ item.title }}
            </a-select-option>
          </a-select>
          <a-button type="primary">
            Primary
          </a-button>
        </a-form-item>
        <a-form-item>
          <a-tabs size="small">
            <a-tab-pane key="1" tab="Tab 1"> </a-tab-pane>
          </a-tabs>
        </a-form-item>
      </a-form>
    </a-spin>
    <a-divider />
    <a-spin :spinning="showLoading">
      <a-form layout="vertical">
        <a-form-item label="选择分区要素">
          <a-select v-model="layerSelectIndex" @change="setNetWorkLayer">
            <a-select-option
              v-for="(item, index) in layerArrOption"
              :key="index"
              :value="index"
            >
              {{ item.title }}
            </a-select-option>
          </a-select>
          <a-button type="primary">
            Primary
          </a-button>
        </a-form-item>
      </a-form>
    </a-spin>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { LayerType, WidgetMixin, UUID } from '@mapgis/web-app-framework'

@Component({ name: 'MpTopologyAnalysis' })
export default class MpTopologyAnalysis extends Mixins(WidgetMixin) {
  layerSelectIndex = null

  // 分时分析加载框
  showLoading = false

  // 选择数据
  get layerSelect() {
    if (this.layerSelectIndex !== null) {
      return this.layerArrOption[this.layerSelectIndex]
    }
    return null
  }

  @Watch('document.defaultMap', { deep: true, immediate: true })
  documentChange(val: Array<unknown>) {
    this.layerSelectIndex = null
    this.layerArrOption = []
    const arr = []
    val.layers().forEach(data => {
      if (
        data.type === LayerType.IGSMapImage ||
        data.type === LayerType.IGSVector
      ) {
        arr.push(data)
      }
    })
    if (arr.length > 0) {
      this.layerArrOption = arr
      this.layerSelectIndex = 0
      this.setNetWorkLayer()
    }
  }
}
</script>

<style lang="less">
.mp-widget-topology-analysis {
  .ant-form-item {
    margin-bottom: 0;
    .ant-tabs-bar {
      margin: 0;
    }
  }
}
</style>
