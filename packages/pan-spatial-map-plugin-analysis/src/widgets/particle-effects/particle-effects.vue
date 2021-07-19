<template>
  <div class="mp-widget-particle-effects">
    <div class="effects-header">
      <mp-toolbar>
        <mp-toolbar-command-group>
          <mp-toolbar-command
            title="粒子火焰"
            icon="fire"
            :active="particleMode === 'fire'"
            @click="onCreateParticle('fire')"
          />
          <mp-toolbar-command
            title="粒子烟雾"
            icon="cloud"
            :active="particleMode === 'smoke'"
            @click="onCreateParticle('smoke')"
          />
        </mp-toolbar-command-group>
        <mp-toolbar-space />
        <mp-toolbar-command-group>
          <mp-toolbar-command
            title="清除"
            icon="delete"
            @click="onClearParticle"
          />
        </mp-toolbar-command-group>
      </mp-toolbar>
    </div>
    <div class="effects-panel">
      <a-divider></a-divider>
      <a-space direction="vertical">
        <a-row>发射速率(个/秒)</a-row>
        <a-row>
          <a-col :span="17">
            <a-slider
              v-model="emissionRate"
              :min="0"
              :max="100"
              @change="val => onChangeEffect(val, 'emissionRate')"
            />
          </a-col>
          <a-col :span="7">
            <a-input-number v-model="emissionRate" :min="0" :max="100" />
          </a-col>
        </a-row>
        <a-row>尺寸(像素)</a-row>
        <a-row>
          <a-col :span="17">
            <a-slider
              v-model="imageSize"
              :min="2"
              :max="60"
              @change="val => onChangeEffect(val, 'imageSize')"
            />
          </a-col>
          <a-col :span="7">
            <a-input-number v-model="imageSize" :min="2" :max="60" />
          </a-col>
        </a-row>
        <a-row>最小存在时间</a-row>
        <a-row>
          <a-col :span="17">
            <a-slider
              v-model="minimumParticleLife"
              :min="0.1"
              :max="30.0"
              :step="0.1"
              @change="val => onChangeEffect(val, 'minimumParticleLife')"
            />
          </a-col>
          <a-col :span="7">
            <a-input-number
              v-model="minimumParticleLife"
              :min="0.1"
              :max="30.0"
              :step="0.1"
            />
          </a-col>
        </a-row>
        <a-row>最大存在时间</a-row>
        <a-row>
          <a-col :span="17">
            <a-slider
              v-model="maximumParticleLife"
              :min="0.1"
              :max="30.0"
              :step="0.1"
              @change="val => onChangeEffect(val, 'maximumParticleLife')"
            />
          </a-col>
          <a-col :span="7">
            <a-input-number
              v-model="maximumParticleLife"
              :min="0.1"
              :max="30.0"
              :step="0.1"
            />
          </a-col>
        </a-row>
        <a-row>最小速度</a-row>
        <a-row>
          <a-col :span="17">
            <a-slider
              v-model="minimumSpeed"
              :min="0"
              :max="30"
              @change="val => onChangeEffect(val, 'minimumSpeed')"
            />
          </a-col>
          <a-col :span="7">
            <a-input-number v-model="minimumSpeed" :min="0" :max="30" />
          </a-col>
        </a-row>
        <a-row>最大速度</a-row>
        <a-row>
          <a-col :span="17">
            <a-slider
              v-model="maximumSpeed"
              :min="0"
              :max="30"
              @change="val => onChangeEffect(val, 'maximumSpeed')"
            />
          </a-col>
          <a-col :span="7">
            <a-input-number v-model="maximumSpeed" :min="0" :max="30" />
          </a-col>
        </a-row>
        <a-row>初始比例</a-row>
        <a-row>
          <a-col :span="17">
            <a-slider
              v-model="startScale"
              :min="0.0"
              :max="10.0"
              @change="val => onChangeEffect(val, 'startScale')"
            />
          </a-col>
          <a-col :span="7">
            <a-input-number v-model="startScale" :min="0.0" :max="10.0" />
          </a-col>
        </a-row>
        <a-row>结束比例</a-row>
        <a-row>
          <a-col :span="17">
            <a-slider
              v-model="endScale"
              :min="0.0"
              :max="10.0"
              @change="val => onChangeEffect(val, 'endScale')"
            />
          </a-col>
          <a-col :span="7">
            <a-input-number v-model="endScale" :min="0.0" :max="10.0" />
          </a-col>
        </a-row>
      </a-space>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import fireImg from './images/fire.png'
import smokeImg from './images/smoke.png'

@Component({ name: 'MpParticleEffects' })
export default class MpParticleEffects extends Mixins(WidgetMixin) {
  // 粒子特效的模式
  private particleMode = ''

  // 发射速率
  private emissionRate = 20

  // 尺寸
  private imageSize = 30

  // 粒子最小存在时间
  private minimumParticleLife = 1.2

  // 粒子最大存在时间
  private maximumParticleLife = 2.2

  // 最小速度
  private minimumSpeed = 1

  // 最大速度
  private maximumSpeed = 4

  // 初始比例
  private startScale = 1.0

  // 结束比例
  private endScale = 5.0

  onClose() {
    this.onClearParticle()
  }

  // 点击删除图标按钮回调
  private onClearParticle() {
    if (window.particle) {
      window.particle.remove()
    }
    this.webGlobe.unRegisterMouseEvent('LEFT_CLICK')
    this.particleMode = ''
  }

  // 点击对应粒子特效图标按钮回调
  private onCreateParticle(type) {
    this.onClearParticle()

    this.particleMode = type
    this.addEventListener()
  }

  // 为鼠标的各种行为注册监听事件
  private addEventListener() {
    this.webGlobe.registerMouseEvent('LEFT_CLICK', event => {
      this.registerMouseLClickEvent(event)
    })
  }

  // 注册鼠标左键点击事件
  private registerMouseLClickEvent(event) {
    // 获取点击点的笛卡尔坐标
    const cartesian = this.webGlobe.viewer.getCartesian3Position(event.position)
    // 获取当前坐标系标准
    const ellipsoid = this.webGlobe.viewer.scene.globe.ellipsoid
    // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
    const cartographic = ellipsoid.cartesianToCartographic(cartesian)

    // 获取该位置的经纬度坐标
    const centerLon = parseFloat(
      this.Cesium.Math.toDegrees(cartographic.longitude).toFixed(8)
    )
    const centerLat = parseFloat(
      this.Cesium.Math.toDegrees(cartographic.latitude).toFixed(8)
    )

    // 初始化高级分析功能管理类
    const advancedAnalysisManager = new window.CesiumZondy.Manager.AdvancedAnalysisManager(
      {
        viewer: this.webGlobe.viewer
      }
    )

    // 创建粒子特效
    window.particle = advancedAnalysisManager.createStableParticle(
      this.particleMode === 'fire' ? fireImg : smokeImg,
      [centerLon, centerLat, cartographic.height]
    )

    // 开启计时
    this.webGlobe.viewer.clock.shouldAnimate = true
    // 开启对数深度缓冲区
    this.webGlobe.viewer.scene.logarithmicDepthBuffer = true

    // 粒子特效初始参数
    const viewModel = {
      emissionRate: this.emissionRate,
      minimumParticleLife: this.minimumParticleLife,
      maximumParticleLife: this.maximumParticleLife,
      minimumSpeed: this.minimumSpeed,
      maximumSpeed: this.maximumSpeed,
      startScale: this.startScale,
      endScale: this.endScale,
      imageSize: new this.Cesium.Cartesian2(this.imageSize, this.imageSize)
    }
    // 粒子参数设置绑定UI
    this.Cesium.knockout.track(viewModel)

    // 注销鼠标的各项监听事件
    this.webGlobe.unRegisterMouseEvent('LEFT_CLICK')

    this.particleMode = ''
  }

  // 粒子特效属性改变回调
  private onChangeEffect(val, key) {
    if (window.particle) {
      if (key === 'imageSize') {
        window.particle.maximumImageSize = new this.Cesium.Cartesian2(val, val)
        window.particle.minimumImageSize = new this.Cesium.Cartesian2(val, val)
      } else {
        window.particle[key] = val
      }
    }
  }
}
</script>

<style lang="less" scoped>
.effects-panel {
  display: flex;
  flex-direction: column;
  .ant-divider-horizontal {
    margin: 6px 0;
  }
  .ant-slider {
    margin: 10px 6px;
  }
  .ant-input-number {
    width: 100%;
    margin-left: 6px;
  }
}
</style>
