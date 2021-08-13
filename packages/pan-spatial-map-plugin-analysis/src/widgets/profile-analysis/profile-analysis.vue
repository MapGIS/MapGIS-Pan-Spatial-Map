<template>
  <div class="mp-widget-profile-analysis">
    <!-- 二维剖面 -->
    <mp-window-wrapper :visible="profile2dVisible">
      <mp-window
        :visible.sync="profile2dVisible"
        :min-width="620"
        :max-height="350"
        anchor="top-center"
        title="二维剖面"
        :expand="expand"
      >
        <div
          id="profileChart"
          style="width: 600px; height: 300px; float: right"
        ></div>
      </mp-window>
    </mp-window-wrapper>
    <div class="mp-footer-actions center">
      <a-button type="primary" @click="analysis">
        分析
      </a-button>
      <a-button type="primary" @click="remove">
        清除
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import * as echarts from 'echarts'

@Component({
  name: 'MpProfileAnalysis'
})
export default class MpProfileAnalysis extends Mixins(WidgetMixin) {
  private terrainProfile = null

  private profile2dVisible = false

  private expand = false

  private depthTestAgainstTerrain = false // 深度检测是否已开启

  /**
   * 打开模块
   */
  onOpen() {}

  /**
   * 关闭模块
   */
  onClose() {}

  // 微件激活时
  onActive() {
    const { viewer } = this.webGlobe
    if (viewer.scene.globe.depthTestAgainstTerrain) {
      this.depthTestAgainstTerrain = true
    }
    this.profile2dVisible = true
  }

  // 微件失活时
  onDeActive() {
    this.isActive = false
  }

  analysis() {
    const { viewer } = this.webGlobe
    if (!this.depthTestAgainstTerrain) {
      viewer.scene.globe.depthTestAgainstTerrain = true
    }
    if (!this.Cesium.defined(this.terrainProfile)) {
      this.terrainProfile = new this.Cesium.TerrainProfile(viewer, echarts)
    }
    this.terrainProfile.profile(this.success)
  }

  profileSuccess() {
    this.expand = true
  }

  remove() {
    if (!this.depthTestAgainstTerrain) {
      this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = false
    }
  }
}
</script>

<style lang="less" scoped>
@import '../index.less';

::v-deep {
  .ant-input-number {
    width: 100%;
  }
}

.mp-widget-profile-analysis {
  display: flex;
  flex-direction: column;
  .model,
  .axis {
    font-size: 12px;
    .ant-radio-wrapper {
      font-size: 12px;
    }
  }
}
</style>
