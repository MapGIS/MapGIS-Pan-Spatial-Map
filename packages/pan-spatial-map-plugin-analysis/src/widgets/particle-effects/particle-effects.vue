<template>
  <div class="mp-widget-particle-effects">
    <mp-toolbar>
      <mp-toolbar-command-group>
        <mp-toolbar-command
          title="火焰"
          icon="fire"
          :active="particleMode === 'fire'"
          @click="onCreateParticle('fire')"
        />
        <mp-toolbar-command
          title="烟雾"
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
    <mp-setting-form class="particle-effects-setting">
      <a-form-item label="发射速率(个/秒)">
        <a-row>
          <a-col :span="15">
            <a-slider
              class="slider-body"
              v-model="emissionRate"
              :min="0"
              :max="100"
              @change="val => onChangeEffect(val, 'emissionRate')"
            />
          </a-col>
          <a-col :span="9">
            <a-input-number
              class="slider-number"
              v-model="emissionRate"
              :min="0"
              :max="100"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="尺寸(像素)">
        <a-row>
          <a-col :span="15">
            <a-slider
              class="slider-body"
              v-model="imageSize"
              :min="2"
              :max="60"
              @change="val => onChangeEffect(val, 'imageSize')"
            />
          </a-col>
          <a-col :span="9">
            <a-input-number
              class="slider-number"
              v-model="imageSize"
              :min="2"
              :max="60"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="最小存在时间">
        <a-row>
          <a-col :span="15">
            <a-slider
              class="slider-body"
              v-model="minimumParticleLife"
              :min="0.1"
              :max="30.0"
              :step="0.1"
              @change="val => onChangeEffect(val, 'minimumParticleLife')"
            />
          </a-col>
          <a-col :span="9">
            <a-input-number
              class="slider-number"
              v-model="minimumParticleLife"
              :min="0.1"
              :max="30.0"
              :step="0.1"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="最大存在时间">
        <a-row>
          <a-col :span="15">
            <a-slider
              class="slider-body"
              v-model="maximumParticleLife"
              :min="0.1"
              :max="30.0"
              :step="0.1"
              @change="val => onChangeEffect(val, 'maximumParticleLife')"
            />
          </a-col>
          <a-col :span="9">
            <a-input-number
              class="slider-number"
              v-model="maximumParticleLife"
              :min="0.1"
              :max="30.0"
              :step="0.1"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="最小速度">
        <a-row>
          <a-col :span="15">
            <a-slider
              class="slider-body"
              v-model="minimumSpeed"
              :min="0"
              :max="30"
              @change="val => onChangeEffect(val, 'minimumSpeed')"
            />
          </a-col>
          <a-col :span="9">
            <a-input-number
              class="slider-number"
              v-model="minimumSpeed"
              :min="0"
              :max="30"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="最大速度">
        <a-row>
          <a-col :span="15">
            <a-slider
              class="slider-body"
              v-model="maximumSpeed"
              :min="0"
              :max="30"
              @change="val => onChangeEffect(val, 'maximumSpeed')"
            />
          </a-col>
          <a-col :span="9">
            <a-input-number
              class="slider-number"
              v-model="maximumSpeed"
              :min="0"
              :max="30"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="初始比例">
        <a-row>
          <a-col :span="15">
            <a-slider
              class="slider-body"
              v-model="startScale"
              :min="0.0"
              :max="10.0"
              :step="0.5"
              @change="val => onChangeEffect(val, 'startScale')"
            />
          </a-col>
          <a-col :span="9">
            <a-input-number
              class="slider-number"
              v-model="startScale"
              :min="0.0"
              :max="10.0"
              :step="0.5"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="结束比例">
        <a-row>
          <a-col :span="15">
            <a-slider
              class="slider-body"
              v-model="endScale"
              :min="0.0"
              :max="10.0"
              :step="0.5"
              @change="val => onChangeEffect(val, 'endScale')"
            />
          </a-col>
          <a-col :span="9">
            <a-input-number
              class="slider-number"
              v-model="endScale"
              :min="0.0"
              :max="10.0"
              :step="0.5"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="发射类型">
        <a-row>
          <a-col :span="14">
            <a-select v-model="emitterValue" @change="onEmitterChange">
              <a-select-option v-for="item in emitterOptions" :key="item">
                {{ item }}
              </a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </a-form-item>
    </mp-setting-form>
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
  private emitterType

  // 发射类型下拉值
  private emitterValue = ''

  // 发射类型下拉项
  private emitterOptions = ['盒状放射', '圆形放射', '锥形放射', '球形放射']

  // 粒子特效集
  private particleArr = []

  onOpen() {
    this.emitterValue = '圆形放射'
  }

  onClose() {
    this.onClearParticle()
  }

  // 点击删除图标按钮回调
  private onClearParticle() {
    if (this.particleArr.length > 0) {
      this.particleArr.forEach(item => {
        item.remove()
      })
    }
    this.webGlobe.unRegisterMouseEvent('LEFT_CLICK')
    this.particleMode = ''
    this.particleArr = []
  }

  // 点击对应粒子特效图标按钮回调
  private onCreateParticle(type) {
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

    const options = {
      startColor: new this.Cesium.Color(1, 1, 1, 1),
      emissionRate: this.emissionRate,
      imageSize: new this.Cesium.Cartesian2(this.imageSize, this.imageSize),
      minimumParticleLife: this.minimumParticleLife,
      maximumParticleLife: this.maximumParticleLife,
      minimumSpeed: this.minimumSpeed,
      maximumSpeed: this.maximumSpeed,
      startScale: this.startScale,
      endScale: this.endScale,
      emitter: this.emitterType,
      gravity: 0.5,
      heading: 30.0,
      pitch: 30.0,
      roll: 30.0
    }

    // 创建粒子特效
    const particle = advancedAnalysisManager.createStableParticle(
      this.particleMode === 'fire' ? fireImg : smokeImg,
      [centerLon, centerLat, cartographic.height],
      options
    )

    this.particleArr.push(particle)

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

  // 粒子特效发射类型变化回调
  private onEmitterChange(value) {
    let emitter
    switch (value) {
      case '盒状放射':
        emitter = new this.Cesium.BoxEmitter(
          new this.Cesium.Cartesian3(5.0, 5.0, 5.0)
        )
        break
      case '圆形放射':
        emitter = new this.Cesium.CircleEmitter(5.0)
        break
      case '锥形放射':
        emitter = new this.Cesium.ConeEmitter(this.Cesium.Math.toRadians(30.0))
        break
      case '球形放射':
        emitter = new this.Cesium.SphereEmitter(5.0)
        break

      default:
        break
    }

    this.particleArr.forEach(item => {
      item.emitter = emitter
    })

    this.emitterType = emitter
  }

  // 粒子特效属性改变回调
  private onChangeEffect(val, key) {
    if (this.particleArr.length > 0) {
      this.particleArr.forEach(item => {
        if (key === 'imageSize') {
          item.maximumImageSize = new this.Cesium.Cartesian2(val, val)
          item.minimumImageSize = new this.Cesium.Cartesian2(val, val)
        } else {
          item[key] = val
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.mp-widget-particle-effects {
  .particle-effects-setting {
    padding-top: 8px;
    .slider-body {
      margin-right: 10px;
    }
    .slider-number {
      width: 100%;
    }
  }
}
</style>
