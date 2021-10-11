<template>
  <div>
    <mapgis-ui-toolbar>
      <mapgis-ui-toolbar-command-group>
        <mapgis-ui-toolbar-command
          title="火焰"
          icon="mapgis-fire"
          :active="particleMode === 'fire'"
          @click="onCreateParticle('fire')"
        />
        <mapgis-ui-toolbar-command
          title="烟雾"
          icon="mapgis-smoke"
          :active="particleMode === 'smoke'"
          @click="onCreateParticle('smoke')"
        />
      </mapgis-ui-toolbar-command-group>
      <mapgis-ui-toolbar-space />
      <mapgis-ui-toolbar-command-group>
        <mapgis-ui-toolbar-command
          title="清除"
          icon="mapgis-delete"
          @click="onClearParticle"
        />
      </mapgis-ui-toolbar-command-group>
    </mapgis-ui-toolbar>
    <mapgis-3d-particle-effects
      :emissionRate="emissionRate"
      :imageSize="imageSize"
      :minimumParticleLife="minimumParticleLife"
      :maximumParticleLife="maximumParticleLife"
      :minimumSpeed="minimumSpeed"
      :maximumSpeed="maximumSpeed"
      :startScale="startScale"
      :endScale="endScale"
      :emitterType="emitterType"
      :imgUrl="imgUrl"
      @load="load"
    />
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin, Objects } from '@mapgis/web-app-framework'
import fireImg from './images/fire.png'
import smokeImg from './images/smoke.png'

@Component({ name: 'MpParticleEffects' })
export default class MpParticleEffects extends Mixins(WidgetMixin) {
  // 粒子特效的模式
  private particleMode = ''

  // 发射速率
  private emissionRate = 20.0

  // 尺寸
  private imageSize = 5.0

  // 粒子最小存在时间
  private minimumParticleLife = 2.0

  // 粒子最大存在时间
  private maximumParticleLife = 3.0

  // 最小速度
  private minimumSpeed = 9.0

  // 最大速度
  private maximumSpeed = 9.5

  // 初始比例
  private startScale = 1.0

  // 结束比例
  private endScale = 4.0

  // 发射类型
  private emitterType = '圆形放射'

  private imgUrl = ''

  private particleEffects = null

  load(particleEffects) {
    this.particleEffects = particleEffects
  }

  onOpen() {
    this.particleEffects.mount()
  }

  onClose() {
    this.particleEffects.unmount()
  }

  onCreateParticle(type) {
    this.particleMode = type
    this.imgUrl = type === 'fire' ? fireImg : smokeImg
    this.particleEffects.onCreateParticle()
  }

  onClearParticle() {
    this.particleEffects.onClearParticle()
  }
}
</script>
