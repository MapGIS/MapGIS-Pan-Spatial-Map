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
        @change="e => (path.para.isLoop = e.target.checked)"
      >
        循环
      </a-checkbox>
      <a-checkbox
        :checked="path.para.showPath"
        @change="e => (path.para.showPath = e.target.checked)"
      >
        显示路径
      </a-checkbox>
      <a-checkbox
        :checked="path.para.showInfo"
        @change="e => (path.para.showInfo = e.target.checked)"
      >
        显示提示信息
      </a-checkbox>
    </div>
    <mp-setting-form class="roadming-setting">
      <a-form-item label="移动速度">
        <a-input
          v-model.number="path.para.speed"
          type="number"
          min="1"
          addon-after="公里/小时"
        />
      </a-form-item>
      <a-form-item label="附加高程">
        <a-input v-model.number="path.para.exHeight" type="number" min="0" />
      </a-form-item>
      <a-form-item label="方位角">
        <a-input
          v-model.number="path.para.til"
          type="number"
          min="-180"
          max="180"
        />
      </a-form-item>
      <a-form-item label="俯仰角">
        <a-input
          v-model.number="path.para.pitch"
          type="number"
          min="-180"
          max="180"
        />
      </a-form-item>
      <a-form-item label="视角">
        <a-select v-model="path.para.animationType">
          <a-select-option v-for="item in perspectiveOptions" :key="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="插值">
        <a-select v-model="path.para.interpolationAlgorithm">
          <a-select-option
            v-for="item in interpolationOptions"
            :key="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
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

    //  初始化漫游动画
    window.SceneWanderManager.animation = new this.Cesium.AnimationAnalyse(
      this.webGlobe.viewer,
      {
        modelUrl: 'models/CesiumAir/Cesium_Air.gltf'
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

    // 若是上帝视角，设置动画的视角高度为4000
    if (window.SceneWanderManager.animation.animationType === 3) {
      window.SceneWanderManager.animation.range = 4000
    }
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
  .roadming-setting {
    .ant-form-item {
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
