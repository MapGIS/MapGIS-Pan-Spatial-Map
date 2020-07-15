<template>
  <div class="base-layers-switch-container row items-start">
    <div
      v-for="item in mapData"
      :key="item.name"
      class="col-4 q-pa-xs column items-center cursor-pointer"
      @click="toggle(item.name)"
    >
      <img class="col full-width" :src="item.image" />
      <div class="col-auto full-width base-layers-switch-container-checkbox">
        <q-checkbox v-model="layerNames" :val="item.name" />
      </div>
      <span>{{ item.name }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import {
  BaseLayersMixin,
  MapTypeChanageMixin
} from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpBaseMapSwitch',
  components: {}
})
export default class MpBaseMapSwitch extends Mixins(
  BaseLayersMixin,
  MapTypeChanageMixin
) {
  private get mapData() {
    return this.config.filter(config => {
      const { scene, visible } = config
      if (this.isPlaneMode) {
        return (scene === '2D' || scene === '23D') && visible === 'true'
      }
      return (scene === '3D' || scene === '23D') && visible === 'true'
    })
  }

  private toggle(name: string) {
    const index = this.layerNames.findIndex(x => x === name)
    if (index >= 0) {
      this.layerNames.splice(index, 1)
    } else {
      this.layerNames = [...this.layerNames, name]
    }
  }
}
</script>

<style lang="scss">
.base-layers-switch-container {
  overflow: auto;

  &-checkbox {
    margin-top: -40px;
  }
}
</style>
