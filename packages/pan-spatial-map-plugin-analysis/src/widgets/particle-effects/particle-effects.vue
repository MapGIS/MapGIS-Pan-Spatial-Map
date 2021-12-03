<template>
  <div>
    <mapgis-3d-particle-effects-manager
      :symbolList="symbolList"
      :particleList="particleList"
      @changeParticel="changeParticle"
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


  private particleEffects = null

  private symbolList =
    [
      {
        guid: "9D09DB87-7955-9295-2E34-61E83C30D3AA",
        name: "外部火焰",
        image: fireImg,
        iconUrl: "mapgis-huoyan",
      },
      {
        guid: "F9FDE880-8F5B-AEDF-CA95-ADC54F02A34F",
        name: "外部烟雾",
        image: smokeImg,
        iconUrl: "mapgis-yanwu",
      },
  ]

  private particleList = []

  private particleListConfig =
    [
      {
        guid: "49A834D7-97C6-F452-4611-6F0739809B50",
        name: "粒子名称1",
        param: {
          emitterType: "圆形放射",
          emissionRate: 20.0,
          imageSize: 5.0,
          minimumParticleLife: 2.0,
          maximumParticleLife: 3.0,
          minimumSpeed: 9.0,
          maximumSpeed: 10.0,
          startScale: 1.0,
          endScale: 4.0,
          symbolGuid: "9D09DB87-7955-9295-2E34-61E83C30D3AA",
          position: {
            longitude: 114.402023,
            latitude: 30.46666308,
            height: 7.160341631125318
          }
        }
      },
      {
        guid: "36F335E8-1F3C-41E2-40AA-EE950D691761",
        name: "粒子名称2",
        param: {
          emitterType: "球形放射",
          emissionRate: 40.0,
          imageSize: 6.0,
          minimumParticleLife: 2.0,
          maximumParticleLife: 3.0,
          minimumSpeed: 9.0,
          maximumSpeed: 10.0,
          startScale: 1.0,
          endScale: 4.0,
          symbolGuid: "9D09DB87-7955-9295-2E34-61E83C30D3AA",
          position: {
            longitude: 114.40092382,
            latitude: 30.46549092,
            height: 1
          }
        }
      }
    ]


  load(particleEffects) {
    this.particleEffects = particleEffects
  }

  onOpen() {
    this.particleEffects.mount()
    this.particleList = this.particleListConfig
  }

  onClose() {
    this.particleEffects.unmount()
  }

  changeParticle(e){
    console.log("particleList",e);
  }
}
</script>
