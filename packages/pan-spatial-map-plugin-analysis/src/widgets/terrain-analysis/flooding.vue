<template>
  <mapgis-3d-analysis-flood
    v-if="loaded"
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
  private loaded = false

  private startHeight = undefined

  private minHeight = undefined

  private maxHeight = undefined

  private floodColor = undefined

  private floodSpeed = undefined

  private specularIntensity = undefined

  private amplitude = undefined

  private animationSpeed = undefined

  private frequency = undefined

  private floodAnalysis = null

  setConfig(config) {
    const {
      startHeight = 0,
      minHeight = 0,
      maxHeight = 2000,
      floodColor = 'rgba(149,232,249,0.5)',
      floodSpeed = 80,
      specularIntensity = 2,
      amplitude = 10,
      animationSpeed = 0.01,
      frequency = 500
    } = config
    this.startHeight = startHeight
    this.minHeight = minHeight
    this.maxHeight = maxHeight
    this.floodColor = floodColor
    this.floodSpeed = floodSpeed
    this.specularIntensity = specularIntensity
    this.amplitude = amplitude
    this.animationSpeed = animationSpeed
    this.frequency = frequency

    this.loaded = true
  }

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
