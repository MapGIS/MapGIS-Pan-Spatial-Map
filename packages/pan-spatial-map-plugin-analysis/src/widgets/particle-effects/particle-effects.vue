<template>
  <div>
    <mapgis-3d-particle-effects-manager
      id='mp-3d-particle-effects'
      :symbolList='symbolList'
      :particleList='particleList'
      @changeParticel='changeParticle'
      @load='load'
    />
  </div>
</template>

<script lang='ts'>
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin, Objects } from '@mapgis/web-app-framework'

declare function require(string): string;

@Component({ name: 'MpParticleEffects' })
export default class MpParticleEffects extends Mixins(WidgetMixin) {

  private particleEffects = null

  private particleList = []

  get symbolList() {
    return this.widgetInfo.config.symbolList.map(item => {
      return {
        guid: item.guid,
        name: item.name,
        image: `${this.baseUrl}${item.image}`,
        iconUrl: item.iconUrl
      }
    })
  }

  load(particleEffects) {
    this.particleEffects = particleEffects
  }

  onOpen() {
    this.particleEffects.mount()
    this.particleList = this.widgetInfo.config.particleListConfig
  }

  onClose() {
    this.particleEffects.unmount()
    // this.particleList = []
  }

  changeParticle(e) {
    console.log('particleList', e)
  }

  // 微件窗口模式切换时回调
  onWindowSize(mode) {
    this.isFullScreen = mode === 'max'
    this.$nextTick(() => {
      const el = document.getElementById('mp-3d-particle-effects')
      if (el) {
        el.style.width = `${mode === 'max' ? this.$el.clientWidth : 300}px`
      }
    })
  }

}
</script>
<style lang='less'>
#mp-3d-particle-effects {
  width: 300px;
  max-width: 100%;
}
</style>
