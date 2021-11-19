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
  IGSSceneSublayerRenderType,
  LayerType
} from '@mapgis/web-app-framework'

@Component
export default class LayerOpacity extends Mixins(AppMixin) {
  @Prop({ required: true }) layers: Array

  setOpacity(val, item) {
    item.opacity = Number((100 - val) / 100)
  }

  isIgsTerrainLayer(layer) {
    let elevation = false
    if (layer.type === LayerType.IGSScene) {
      layer.activeScene.sublayers.forEach(igsSceneSublayer => {
        if (
          igsSceneSublayer.renderType === IGSSceneSublayerRenderType.elevation
        ) {
          elevation = true
        }
      })
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
