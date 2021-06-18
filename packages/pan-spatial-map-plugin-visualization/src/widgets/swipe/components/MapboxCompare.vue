<template>
  <div class="swipe-mapbox-compare">
    <!-- 空数据提示 -->
    <div class="swipe-mapbox-empty" v-if="!showCompare">
      <a-empty description="卷帘分析功能至少需要选择2个图层" />
    </div>
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
    <!-- 图层设置 -->
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
      <swipe-setting />
    </a-drawer>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch, InjectReactive } from 'vue-property-decorator'
import { Document, MpMapboxView, Layer } from '@mapgis/web-app-framework'
import SwipeSetting from './SwipeSetting'

@Component({
  components: {
    MpMapboxView,
    SwipeSetting
  }
})
export default class MapboxCompare extends Vue {
  @InjectReactive({
    from: 'swipe',
    default: () => ({})
  })
  swipe: any

  // 上级(左侧)地图Document
  aboveDocument: Document = new Document()

  // 下级(右侧)地图Document
  belowDocument: Document = new Document()

  // 弹框开关
  settingPanelVisible = true

  // 图层样式
  mapStyle: any = {
    version: 8,
    sources: {},
    layers: [],
    glyphs:
      'http://develop.smaryun.com:6163/igs/rest/mrms/vtiles/fonts/{fontstack}/{range}.pbf'
  }

  // 卷帘方向
  get direction() {
    return this.swipe.direction || 'vertical'
  }

  // 上级(左侧)图层
  get aboveLayer() {
    return this.swipe.aboveLayer || {}
  }

  // 下级(右侧)图层
  get belowLayer() {
    return this.swipe.belowLayer || {}
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

  /**
   * 添加图层
   */
  addLayerToMap({ defaultMap }: Document, layer: Layer) {
    if (layer) {
      defaultMap.removeAll()
      defaultMap.add(layer)
    }
  }

  /**
   * 面板开关
   */
  onToggleSettingPanel() {
    this.settingPanelVisible = !this.settingPanelVisible
  }

  /**
   * 监听: 上级(左侧)图层
   */
  @Watch('aboveLayer.id')
  watchAboveLayer(nV) {
    this.addLayerToMap(this.aboveDocument, this.aboveLayer)
  }

  /**
   * 监听: 下级(右侧)图层
   */
  @Watch('belowLayer.id')
  watchBelowLayer(nV) {
    this.addLayerToMap(this.belowDocument, this.belowLayer)
  }
}
</script>
<style lang="less" scoped>
/deep/ .ant-drawer-right.ant-drawer-open {
  .ant-drawer-content-wrapper {
    box-shadow: none;
    border-left: 1px solid @primary-color;
  }
}

.swipe-mapbox-compare {
  width: 100%;
  height: 100%;
  position: relative;
  /deep/ .mapgis-compare-bar {
    width: 100%;
    height: 100%;
    min-width: 77vw;
    min-height: 77vh;
  }
}

.swipe-mapbox-empty {
  height: 100%;
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
