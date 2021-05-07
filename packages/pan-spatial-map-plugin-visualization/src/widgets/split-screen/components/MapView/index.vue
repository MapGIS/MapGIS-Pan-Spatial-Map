<template>
  <div class="map-view-wrap">
    <div class="map-view">
      <a-tooltip v-for="item in tools" :key="item.label" :title="item.label">
        <a-icon :type="item.icon" @click.stop="onSettingIconClick(item)" />
      </a-tooltip>
    </div>
    <mp-mapbox-view :document="document" :mapStyle="mapStyle" />
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator'
import {
  Document,
  WidgetMixin,
  MpMapboxView,
  Layer
} from '@mapgis/web-app-framework'
import mapViewOperationMixin from '../../mixins/map-view-operation-mixin'

type Noop = (l: Layer) => void

interface ITool {
  label: string
  icon: string
  method: string
}

@Component({
  components: {
    MpMapboxView
  }
})
export default class MapView extends Mixins<{
  [k: string]: any
}>(mapViewOperationMixin) {
  @Prop({ default: () => ({}) }) layer!: Layer

  // 图层样式
  mapStyle: any = {
    version: 8,
    name: '空样式',
    sources: {
      Default: {
        type: 'vector',
        tiles: [
          'http://localhost:6163/igs/rest/mrms/tile/IGServer/{z}/{y}/{x}?type=cpbf'
        ],
        minZoom: 0,
        maxZoom: 15
      }
    },
    sprite: 'http://localhost:6163/igs/rest/mrms/vtiles/sprite',
    glyphs:
      'http://localhost:6163/igs/rest/mrms/vtiles/fonts/{fontstack}/{range}.pbf',
    layers: [
      {
        id: '背景',
        type: 'background',
        paint: {
          'background-color': {
            stops: [
              [6, '#4a5768'],
              [8, '#424d5c']
            ]
          }
        }
      }
    ]
  }

  // 工具按钮
  tools: ITool[] = [
    {
      label: '查询',
      icon: 'search',
      method: 'query'
    },
    {
      label: '放大',
      icon: 'zoom-in',
      method: 'zoomIn'
    },
    {
      label: '缩小',
      icon: 'zoom-out',
      method: 'zoomOut'
    },

    {
      label: '复位',
      icon: 'redo',
      method: 'restore'
    },
    {
      label: '移动',
      icon: 'drag',
      method: 'move'
    },
    {
      label: '清除',
      icon: 'delete',
      method: 'clear'
    }
  ]

  /**
   * 获取地图
   */
  get document() {
    const document: any = new Document()
    const defaultMap = document.defaultMap
    defaultMap.remove(this.layer)
    defaultMap.add(this.layer)
    return document
  }

  /**
   * 设置图标点击操作
   * @param item<object>
   */
  onSettingIconClick(item: ITool) {
    const fn: Noop = this[item.method]
    if (typeof fn === 'function') {
      fn(this.layer)
    }
  }

  /**
   * 查询
   */
  query() {}

  /**
   * 放大
   */
  zoomOut() {
    // this.operationType = OperationType.ZOOMIN
    this.enableDragePanMap(false)
    this.enableDrawer()
  }

  /**
   * 缩小
   */
  zoomIn() {}

  /**
   * 重置
   */
  restore() {}

  /**
   * 清除
   */
  clear() {}
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
