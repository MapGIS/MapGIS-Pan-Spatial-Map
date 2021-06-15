<template>
  <div class="swipe-mapbox-compare">
    <!-- 空数据提示 -->
    <a-empty
      description="卷帘分析功能至少需要选择2个图层"
      v-if="!showCompare"
    />
    <!-- 卷帘组件 -->
    <mapgis-compare v-else :orientation="direction">
      <mp-mapbox-view
        slot="beforeMap"
        :document="aboveDocument"
        :mapStyle="mapStyle"
      />
      <mp-mapbox-view
        slot="afterMap"
        :document="belowDocument"
        :mapStyle="mapStyle"
      />
    </mapgis-compare>
    <a-drawer
      title="设置"
      placement="right"
      :closable="false"
      :get-container="false"
      :width="240"
      :visible="settingPanelVisible"
      :wrap-style="drawerWrapStyle"
      :header-style="drawerHeaderStyle"
      :body-style="drawerBodyStyle"
      :mask="false"
    >
      <div class="drawer-handle" slot="handle" @click="onToggleSettingPanel">
        <a-icon :type="settingPanelVisible ? 'right' : 'left'" />
      </div>
      <swipe-setting
        :is-open="isOpen"
        @on-direct-change="onDirectChange"
        @on-above-layer-change="onAboveLayerChange"
        @on-below-layer-change="onBelowLayerChange"
      />
    </a-drawer>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Document, MpMapboxView, Layer } from '@mapgis/web-app-framework'
import SwipeSetting from './SwipeSetting'

export type Direction = 'vertical' | 'horizontal'

@Component({
  components: {
    MpMapboxView,
    SwipeSetting
  }
})
export default class MapboxCompare extends Vue {
  @Prop() readonly isOpen!: boolean
  // 上级(左侧)图层
  aboveLayer: Layer | object = {}

  // 下级(右侧)图层
  belowLayer: Layer | object = {}

  // 卷帘方向
  direction: Direction = 'vertical'

  // 弹框开关
  settingPanelVisible = true

  // 上级(左侧)地图Document
  aboveDocument = new Document()

  // 下级(右侧)地图Document
  belowDocument = new Document()

  // 图层样式
  mapStyle: any = {
    version: 8,
    sources: {},
    layers: [],
    glyphs:
      'http://develop.smaryun.com:6163/igs/rest/mrms/vtiles/fonts/{fontstack}/{range}.pbf'
  }

  // 是否展示卷帘
  get showCompare() {
    return this.aboveLayer.id && this.belowLayer.id
  }

  // 弹框wrap样式
  get drawerWrapStyle() {
    return {
      position: 'absolute'
    }
  }

  // 弹框头部样式
  get drawerHeaderStyle() {
    return {
      display: 'none'
    }
  }

  // 弹框内容样式
  get drawerBodyStyle() {
    return {
      display: 'flex',
      padding: '12px'
    }
  }

  onCloseSettingPanel() {
    this.settingPanelVisible = false
  }

  onToggleSettingPanel() {
    this.settingPanelVisible = !this.settingPanelVisible
  }

  onUpdate(layer: Layer, type: 'above' | 'below') {
    const defaultMap = this[`${type}Document`].defaultMap
    defaultMap.removeAll()
    if (layer) {
      this[`${type}Layer`] = layer
      defaultMap.add(layer)
    }
  }

  onDirectChange(direct) {
    this.direction = direct
  }

  onAboveLayerChange(aLayer) {
    this.onUpdate(aLayer, 'above')
  }

  onBelowLayerChange(bLayer) {
    this.onUpdate(bLayer, 'below')
  }
}
</script>
<style lang="less" scoped>
.swipe-mapbox-compare {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.drawer-handle {
  position: absolute;
  height: 64px;
  top: calc(50% - 32px);
  left: -16px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: @base-bg-color;
  border-radius: 4px 0 0 4px;
  border: 1px solid @primary-color;
  border-right-color: transparent;
  cursor: pointer;

  &:hover {
    color: white;
    background: @primary-color;
  }
}
</style>
