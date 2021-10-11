<template>
  <mapgis-3d-analysis-flood
    :startHeight="startHeight"
    :minHeight="minHeight"
    :maxHeight="maxHeight"
    :floodColor="floodColor"
    :floodSpeed="floodSpeed"
    :specularIntensity="specularIntensity"
    :amplitude="amplitude"
    :animationSpeed="animationSpeed"
    :frequency="frequency"
    @load="load"
  />
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpFlooding'
})
export default class MpFlooding extends Mixins(WidgetMixin) {
  private startHeight = 0

  private minHeight = 0

  private maxHeight = 2000

  private floodColor = 'rgba(149,232,249,0.5)'

  private floodSpeed = 500

  private specularIntensity = 2

  private amplitude = 10

  private animationSpeed = 0.01

  private frequency = 500

  private floodAnalysis = null

  load(floodAnalysis) {
    this.floodAnalysis = floodAnalysis
  }

  onActive() {
    this.floodAnalysis.mount()
  }

  // 微件失活时
  onDeActive() {
    this.floodAnalysis.unmount()
  }
}
</script>
