<template>
  <div class="mp-widget-split-screen">
    <a-row justify="space-between" :gutter="[16, 0]">
      <a-col span="20" class="split-screen-map-wrap">
        <!-- 分屏地图 -->
        <split-screen-map :layers="flatLayers" />
      </a-col>
      <a-col span="4">
        <!-- 分屏设置 -->
        <split-screen-setting :layers="flatLayers" />
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import SplitScreenMap from './components/SplitScreenMap'
import SplitScreenSetting from './components/SplitScreenSetting'

@Component({
  name: 'MpSplitScreen',
  components: {
    SplitScreenMap,
    SplitScreenSetting
  }
})
export default class MpSplitScreen extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  /**
   * 获取选中目录树下的叶子节点图层中的可见图层
   */
  get flatLayers() {
    const _layers = this.document.defaultMap
      .getFlatLayers()
      .filter(v => v.isVisible)
    console.log('图层', _layers)
    return _layers
  }
}
</script>

<style lang="less" scoped>
.mp-widget-split-screen,
.split-screen-map-wrap,
.split-screen-map-wrap + div,
/deep/ .ant-row {
  height: 100%;
}
.split-screen-map-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  + div {
    border-left: 1px solid #f0f0f0;
  }
}
</style>
