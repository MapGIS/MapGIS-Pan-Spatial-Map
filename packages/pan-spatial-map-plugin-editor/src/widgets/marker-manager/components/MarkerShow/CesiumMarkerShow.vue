<template>
  <div class="cesium-marker-show">
    <div v-for="item in markers" :key="item.id">
      <CesiumMarkerDialog
        :marker="item"
        :currentMarkerId="currentMarkerId"
        @currentMarkerId="onCurrentMarkerId"
      ></CesiumMarkerDialog>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { MapMixin } from '@mapgis/web-app-framework'
import CesiumMarkerDialog from './CesiumMarkerDialog.vue'

@Component({
  components: { CesiumMarkerDialog }
})
export default class CesiumMarkerShow extends Mixins(MapMixin) {
  @Prop({ type: Array, required: true }) markers!: Record<string, any>[]

  private currentMarkerId = ''

  onCurrentMarkerId(id: string) {
    this.currentMarkerId = id
  }
}
</script>

<style lang="less" scoped></style>
