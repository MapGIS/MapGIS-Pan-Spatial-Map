<template>
  <div>
    <mapgis-3d-ponding-simulation
      @loaded="loaded"
      @isPonding="
        (e) => {
          pond = e
        }
      "
      @costTime="
        (e) => {
          sliderValue = e
        }
      "
      :pondingTime="pondingTime"
      :multiSpeed="multiSpeed"
    />
    <mp-window-wrapper :visible="showTimeline">
      <mp-placement
        :position="'bottom-left'"
        v-show="showTimeline"
        :offset="[52, 60]"
        style="right:0px;margin-right:0px"
      >
        <mapgis-3d-ponding-simulation-timeline
          :costTime="sliderValue"
          :isPlaying="pond"
          @updateTime="
            (e) => {
              pondingTime = e
            }
          "
          @updateSpeed="
            (e) => {
              multiSpeed = e
            }
          "
          @play="addSimulation"
        />
      </mp-placement>
    </mp-window-wrapper>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpPondingSimulation',
})
export default class MpPondingSimulation extends Mixins(WidgetMixin) {
  private pondingTime = 24

  private multiSpeed = 1

  private pond = false

  private sliderValue = 0

  private showTimeline = false

  /**
   * 微件打开时
   */
  onOpen() {
    this.ponding.mounted()
    this.showTimeline = true
  }

  /**
   * 微件关闭时
   */
  onClose() {
    this.ponding.destroyed()
    this.showTimeline = false
  }

  loaded(ponding) {
    this.ponding = ponding
  }

  addSimulation() {
    this.ponding.addSimulation()
  }
}
</script>

<style lang="less" scoped></style>
