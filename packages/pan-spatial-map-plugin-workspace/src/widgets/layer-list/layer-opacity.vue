<template>
  <ul class=" beauty-scroll">
    <li
      v-for="item in layers"
      v-show="isIgsTerrainLayer(item) && !isDataFlow(item)"
      :key="item.id"
    >
      <a-tooltip>
        <template slot="title">
          {{ item.description }}
        </template>
        <label>{{ item.title }}</label>
      </a-tooltip>

      <a-slider
        :value="100 - Number(item.opacity) * 100"
        @change="val => setOpacity(val, item)"
        :min="0"
        :max="100"
        :tipFormatter="val => `${val}%`"
      />
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins, Watch } from 'vue-property-decorator'
import {
  AppMixin,
  IGSSceneSublayerType,
  LayerType
} from '@mapgis/web-app-framework'

@Component
export default class LayerOpacity extends Mixins(AppMixin) {
  @Prop({ required: true }) layers: Array

  setOpacity(val, item) {
    item.opacity = Number((100 - val) / 100)
    if (item.type === LayerType.VectorTile) {
      // 矢量瓦片不支持改整体的透明度，遍历layers，设置每个layer的透明度
      const { layers } = item.styleList[0]
      layers.forEach(layer => {
        const { type } = layer
        if (layer.paint !== undefined) {
          // circle/line/fill/fill-extrusion/symbol/background
          if (type === 'circle') {
            layer.paint['circle-opacity'] = Number((100 - val) / 100)
          } else if (type === 'line') {
            layer.paint['line-opacity'] = Number((100 - val) / 100)
          } else if (type === 'fill') {
            layer.paint['fill-opacity'] = Number((100 - val) / 100)
          } else if (type === 'fill-extrusion') {
            layer.paint['fill-extrusion-opacity'] = Number((100 - val) / 100)
          } else if (type === 'symbol') {
            layer.paint['icon-opacity'] = Number((100 - val) / 100)
            layer.paint['text-opacity'] = Number((100 - val) / 100)
          } else if (type === 'background') {
            layer.paint['background-opacity'] = Number((100 - val) / 100)
          }
        }
      })
    }
  }

  isIgsTerrainLayer(layer) {
    let elevation = false
    if (layer.type === LayerType.IGSScene) {
      if (layer.activeScene) {
        layer.activeScene.sublayers.forEach(igsSceneSublayer => {
          if (igsSceneSublayer.type === IGSSceneSublayerType.elevation) {
            elevation = true
          }
        })
      }
    }
    return !elevation
  }

  isDataFlow(layer) {
    return layer.type === LayerType.DataFlow
  }
}
</script>

<style lang="less" scoped>
ul {
  flex: 1 1 0%;
  overflow: auto;
  list-style: none;
  margin: 0;
  padding: 0 10px;
  li {
    margin-bottom: 10px;
  }
}
</style>
