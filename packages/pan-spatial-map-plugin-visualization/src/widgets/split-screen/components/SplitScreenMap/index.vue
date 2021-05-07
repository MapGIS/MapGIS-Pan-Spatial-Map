<template>
  <div class="split-screen-map">
    <a-empty
      description="请在目录树中勾选需要分屏的专题"
      v-if="!layers.length"
    />
    <a-row v-else :gutter="[5, 8]">
      <a-col
        v-for="l in layers"
        :key="l.id"
        :span="mapSpan.span"
        :style="{ height: mapSpan.height }"
      >
        <div class="map-wrap">
          <div class="map-tools">
            <a-tooltip
              v-for="item in tools"
              :key="item.label"
              :title="item.label"
            >
              <a-icon
                :type="item.icon"
                @click.stop="onSettingIconClick(item, l)"
              />
            </a-tooltip>
          </div>
          <mp-mapbox-view :document="getDocument(l)" :mapStyle="mapStyle" />
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import {
  Document,
  WidgetMixin,
  MpMapboxView,
  Layer
} from '@mapgis/web-app-framework'

interface ITool {
  label: string
  icon: string
}

@Component({
  components: {
    MpMapboxView
  }
})
export default class SplitScreenMap extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  @Prop({
    default: () => ({
      span: 12,
      height: '100%'
    })
  })
  mapSpan!: object

  @Prop({ default: () => [] }) layers!: Layer[]

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

  tools: ITool[] = [
    {
      label: '查询',
      icon: 'search'
    },
    {
      label: '放大',
      icon: 'zoom-in'
    },
    {
      label: '缩小',
      icon: 'zoom-out'
    },

    {
      label: '复位',
      icon: 'redo'
    },
    {
      label: '移动',
      icon: 'drag'
    },
    {
      label: '清除',
      icon: 'delete'
    }
  ]

  /**
   * 设置图层
   * @param layer<object>
   */
  getDocument(layer) {
    const document: any = new Document()
    const defaultMap = document.defaultMap
    defaultMap.remove(layer)
    defaultMap.add(layer)
    return document
  }

  /**
   * 设置图标点击操作
   * @param item<object>
   * @param layer<object>
   */
  onSettingIconClick(item: ITool, layer: Layer) {}
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
