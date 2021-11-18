<template>
  <div class="mp-path-roaming">
    <div class="header" @click="onGotoHome">
      <div>
        <a-icon class="return" type="left" />
      </div>
      <div class="name">{{ path.name }}</div>
    </div>
    <div class="roaming-actions">
      <a-button
        class="roaming-action"
        :title="playTitle"
        type="primary"
        @click="onClickStartOrPauseOrResume"
      >
        {{ playTitle }}
      </a-button>
      <a-button
        class="roaming-action"
        type="primary"
        :disabled="!isStart"
        @click="onClickStop"
      >
        停止
      </a-button>
    </div>
    <div class="roaming-options">
      <a-checkbox
        :checked="path.para.isLoop"
        @change="e => onCheckBoxChange(e, 'isLoop')"
      >
        循环
      </a-checkbox>
      <a-checkbox
        :checked="path.para.showPath"
        @change="e => onCheckBoxChange(e, 'showPath')"
      >
        显示路径
      </a-checkbox>
      <a-checkbox
        :checked="path.para.showInfo"
        @change="e => onCheckBoxChange(e, 'showInfo')"
      >
        显示提示信息
      </a-checkbox>
    </div>
    <mp-setting-form
      class="roadming-setting"
      :itemLayout="'grid'"
      :labelCol="{ span: 6 }"
      :wrapperCol="{ span: 18 }"
    >
      <a-form-item label="移动速度">
        <a-row>
          <a-col :span="24">
            <a-input
              v-model.number="path.para.speed"
              type="number"
              min="1"
              :disabled="isStart ? true : false"
              addon-after="公里/小时"
              @change="onSpeedChange"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="附加高程">
        <a-row>
          <a-col :span="24">
            <a-input-number
              v-model="path.para.exHeight"
              :min="0"
              :disabled="isStart ? true : false"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="方位角" v-show="path.para.animationType !== 1">
        <a-row>
          <a-col :span="15">
            <a-slider
              class="slider-body"
              v-model="path.para.til"
              :min="-180"
              :max="180"
              :disabled="path.para.animationType === 1 ? true : false"
              @change="val => onEffectsChange(val, 'heading')"
            />
          </a-col>
          <a-col :span="9">
            <a-input-number
              class="slider-number"
              v-model="path.para.til"
              :min="-180"
              :max="180"
              :disabled="path.para.animationType === 1 ? true : false"
              @change="val => onEffectsChange(val, 'heading')"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="俯仰角" v-show="path.para.animationType === 2">
        <a-row>
          <a-col :span="15">
            <a-slider
              class="slider-body"
              v-model="path.para.pitch"
              :min="-180"
              :max="180"
              :disabled="path.para.animationType !== 2 ? true : false"
              @change="val => onEffectsChange(val, 'pitch')"
            />
          </a-col>
          <a-col :span="9">
            <a-input-number
              class="slider-number"
              v-model="path.para.pitch"
              :min="-180"
              :max="180"
              :disabled="path.para.animationType !== 2 ? true : false"
              @change="val => onEffectsChange(val, 'pitch')"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="距离" v-show="path.para.animationType !== 1">
        <a-row>
          <a-col :span="15">
            <a-slider
              class="slider-body"
              v-model="path.para.range"
              :min="0"
              :max="200"
              :disabled="path.para.animationType === 1 ? true : false"
              @change="val => changeRange(val)"
            />
          </a-col>
          <a-col :span="9">
            <a-input-number
              class="slider-number"
              v-model="path.para.range"
              :min="0"
              :max="200"
              :disabled="path.para.animationType === 1 ? true : false"
              @change="val => changeRange(val)"
            />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="视角">
        <a-row>
          <a-col :span="24">
            <a-select v-model="path.para.animationType" @change="onTypeChange">
              <a-select-option
                v-for="item in perspectiveOptions"
                :key="item.value"
              >
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-col></a-row
        >
      </a-form-item>
      <a-form-item label="插值">
        <a-row>
          <a-col :span="24">
            <a-select
              v-model="path.para.interpolationAlgorithm"
              :disabled="isStart ? true : false"
            >
              <a-select-option
                v-for="item in interpolationOptions"
                :key="item.value"
              >
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="模型">
        <a-row>
          <a-col :span="24">
            <a-select
              v-model="modelUrl"
              @change="onModelChange"
              :disabled="isStart"
            >
              <a-select-option v-for="item in modelOptions" :key="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-col></a-row
        >
      </a-form-item>
    </mp-setting-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject, Watch } from 'vue-property-decorator'

@Component({
  name: 'PathRoaming'
})
export default class PathRoaming extends Vue {
  @Inject('Cesium') Cesium: any

  @Inject('webGlobe') webGlobe: any

  @Prop() path

  private isStart = false

  private isPause = false

  // 视角
  private perspectiveOptions = [
    {
      label: '跟随',
      value: 1
    },
    {
      label: '锁定第一视角',
      value: 2
    },
    {
      label: '上帝视角',
      value: 3
    }
  ]

  // 插值
  private interpolationOptions = [
    {
      label: '拉格朗日插值',
      value: 'LagrangePolynomialApproximation'
    },
    {
      label: '线性近似',
      value: 'LinearApproximation'
    },
    {
      label: '埃尔米特插值',
      value: 'HermitePolynomialApproximation'
    }
  ]

  private publicPath = process.env.BASE_URL

  private modelUrl = `${this.publicPath}models/CesiumModels/Cesium_Man.glb`

  private modelOptions = [
    {
      label: '人',
      value: `${this.publicPath}models/CesiumModels/Cesium_Man.glb`
    },
    {
      label: '卡车',
      value: `${this.publicPath}models/CesiumModels/CesiumMilkTruck.glb`
    },
    {
      label: '飞机',
      value: `${this.publicPath}models/CesiumModels/Cesium_Air.gltf`
    }
  ]

  get playTitle() {
    if (!this.isStart) {
      return '开始'
    } else {
      return this.isPause ? '继续' : '暂停'
    }
  }

  created() {
    window.SceneWanderManager = {
      animation: null
    }
    const vm = this

    //  初始化漫游动画
    window.SceneWanderManager.animation = new this.Cesium.AnimationAnalyse(
      this.webGlobe.viewer,
      {
        modelUrl: vm.modelUrl,
        complete: function() {
          vm.isStart = false
          vm.isPause = false
        }
      }
    )
  }

  private onGotoHome() {
    this.onClickStop()
    this.$emit('goto-home')
  }

  private onClickStartOrPauseOrResume() {
    if (!this.isStart) {
      // 设置播放动画的各项属性
      if (this.path.path.length > 0) {
        window.SceneWanderManager.animation.positions = this.Cesium.Cartesian3.fromDegreesArrayHeights(
          this.path.path
        )
        this.setAnimationAttr()

        window.SceneWanderManager.animation.start()

        this.isStart = true
        this.isPause = false
      }
    } else {
      if (!this.isPause) window.SceneWanderManager.animation.pause = true
      else window.SceneWanderManager.animation.pause = false

      this.isPause = !this.isPause
    }
  }

  onClickStop() {
    if (this.isStart) window.SceneWanderManager.animation.stop()
    this.isStart = false
    this.isPause = false
  }

  // 设置动画的播放属性
  private setAnimationAttr() {
    // 默认速度的单位为m/s，这里将公里每小时转换为m/s
    window.SceneWanderManager.animation.speed = (
      this.path.para.speed * 0.28
    ).toFixed(2)
    window.SceneWanderManager.animation.exHeight = this.path.para.exHeight
    window.SceneWanderManager.animation.heading = this.path.para.til
    window.SceneWanderManager.animation.pitch = this.path.para.pitch
    window.SceneWanderManager.animation.animationType = this.path.para.animationType
    window.SceneWanderManager.animation.isLoop = this.path.para.isLoop
    window.SceneWanderManager.animation.isShowPath = this.path.para.showPath
    window.SceneWanderManager.animation.showInfo = this.path.para.showInfo

    switch (this.path.para.interpolationAlgorithm) {
      case 'LagrangePolynomialApproximation':
        window.SceneWanderManager.animation.interpolationAlgorithm = this.Cesium.LagrangePolynomialApproximation // 拉格朗日插值
        break
      case 'LinearApproximation':
        window.SceneWanderManager.animation.interpolationAlgorithm = this.Cesium.LinearApproximation // 线性近似
        break
      case 'HermitePolynomialApproximation':
        window.SceneWanderManager.animation.interpolationAlgorithm = this.Cesium.HermitePolynomialApproximation // 埃尔米特插值
        break
      default:
        break
    }

    // 若是上帝视角，设置动画的视角高度为200
    if (window.SceneWanderManager.animation.animationType === 3) {
      this.path.para.range = 200
    } else {
      this.path.para.range = 0
    }
    window.SceneWanderManager.animation.range = this.path.para.range
  }

  // 多选项变化时回调(循环、显示路径、显示提示信息)
  private onCheckBoxChange(e, key) {
    this.path.para[key] = e.target.checked

    if (key === 'showPath') {
      if (
        window.SceneWanderManager.animation &&
        window.SceneWanderManager.animation.animationModel
      ) {
        window.SceneWanderManager.animation.animationModel.path.show._value =
          e.target.checked
      }
    } else {
      window.SceneWanderManager.animation[key] = e.target.checked
    }
  }

  // 漫游速度变化时回调
  private onSpeedChange(e) {
    window.SceneWanderManager.animation.speed = parseFloat(
      e.target.value * 0.28
    ).toFixed(2)
    // TODO 临时解决办法，cesium1.8已解决这个问题
    // speed默认值是10
    window.SceneWanderManager.animation.speedupFactor = e.target.value
      ? e.target.value / 10
      : 1
  }

  // 漫游方位角、俯仰角变化时回调
  private onEffectsChange(val, key) {
    window.SceneWanderManager.animation[key] = this.Cesium.Math.toRadians(
      parseInt(val)
    )
  }

  private changeRange(val) {
    window.SceneWanderManager.animation.range = parseInt(val)
  }

  // 漫游视角变化时回调
  private onTypeChange(value) {
    window.SceneWanderManager.animation.animationType = value
    // 若是上帝视角，设置动画的视角高度为200
    if (window.SceneWanderManager.animation.animationType === 3) {
      this.path.para.range = 200
    } else {
      this.path.para.range = 0
    }
    window.SceneWanderManager.animation.range = this.path.para.range
  }

  private onModelChange(value) {
    window.SceneWanderManager.animation._modelUrl = value
  }
}
</script>

<style lang="less">
.mp-path-roaming {
  .header {
    cursor: pointer;
    display: flex;
    align-content: center;
    .return {
      color: @primary-color;
      margin: 0 10px 0 0;
    }
    .name {
      flex: 1;
    }
  }
  .roaming-actions {
    padding: 12px 0;
    display: flex;
    justify-content: space-between;
    .roaming-action {
      width: calc(50% - 4px);
    }
  }
  .roaming-options {
    padding-bottom: 12px;
  }
  .ant-checkbox-wrapper {
    font-size: 12px;
  }
  .roadming-setting {
    padding-top: 8px;
    .slider-body {
      margin-right: 10px;
    }
    .slider-number {
      width: 100%;
    }
    .ant-input-number {
      width: 100%;
    }
  }
}
</style>
