<template>
  <div ref="measureContainer" class="mapbox-measure-wrapper">
    <div>
      <q-btn
        v-for="(item, i) in buttons"
        :key="i"
        flat
        dense
        :color="item.type"
        @click="item.click"
        v-show="item.tip !== '高级设置' || isPlaneMode"
      >
        <q-icon :name="item.icon" />
        {{ item.tip }}
      </q-btn>
    </div>
    <div v-show="!showSetting && isPlaneMode">
      <div class="col-auto row items-center top-02em">
        <label class="col-3 text-right">单位：</label>
        <q-select
          class="col-8"
          v-model="unit"
          :options="units"
          dense
          outlined
        />
      </div>
      <div class="col-auto items-center group-title content-subTitle-div">
        <span class="text-subtitle1">测量结果</span>
      </div>
      <div v-show="measureMode.mode === measureModes.measureLength">
        <div class="col-auto row items-center top-02em">
          <label class="col-4 text-right">投影平面长度：</label>
          <span>{{ results.planeLength }}</span>
        </div>

        <div class="col-auto row items-center top-02em">
          <label class="col-4 text-right">椭球实地长度：</label>
          <span>{{ results.ellipsoidLength }}</span>
        </div>
      </div>

      <div v-show="measureMode.mode === measureModes.measureArea">
        <div class="col-auto row items-center top-02em">
          <label class="col-4 text-right">投影平面周长：</label>
          <span>{{ results.planePerimeter }}</span>
        </div>

        <div class="col-auto row items-center top-02em">
          <label class="col-4 text-right">投影平面面积：</label>
          <span>{{ results.planeArea }}</span>
        </div>

        <div class="col-auto row items-center top-02em">
          <label class="col-4 text-right">椭球实地周长：</label>
          <span>{{ results.ellipsoidPerimeter }}</span>
        </div>

        <div class="col-auto row items-center top-02em">
          <label class="col-4 text-right">椭球实地面积：</label>
          <span>{{ results.ellipsoidArea }}</span>
        </div>
      </div>
    </div>

    <div v-show="showSetting && isPlaneMode">
      <div class="col-auto items-center group-title content-subTitle-div">
        <span class="text-subtitle1">文字样式</span>
      </div>

      <div class="col-auto row items-center top-02em">
        <label class="col-3 text-right">字体：</label>
        <q-select
          class="col-8"
          dense
          outlined
          v-model="textType"
          :options="textTypes"
        />
      </div>

      <div class="col-auto row items-center top-02em">
        <label class="col-3 text-right">字体颜色：</label>
        <q-input
          class="col-8"
          dense
          outlined
          v-model="textColor"
          :style="{ background: textColor }"
        >
          <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-color v-model="textColor" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col-auto row items-center top-02em">
        <label class="col-3 text-right">字号：</label>
        <q-input
          class="col-8"
          dense
          outlined
          v-model.number="textSize"
          type="number"
        />
      </div>

      <div class="col-auto items-center group-title content-subTitle-div">
        <span class="text-subtitle1">轮廓线样式</span>
      </div>
      <div class="col-auto row items-center top-02em">
        <label class="col-3 text-right">颜色：</label>
        <q-input
          class="col-8"
          dense
          outlined
          v-model="lineColor"
          :style="{ background: lineColor }"
        >
          <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-color v-model="lineColor" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col-auto row items-center top-02em">
        <label class="col-3 text-right">样式：</label>
        <q-select
          class="col-8"
          dense
          outlined
          v-model="lineType"
          :options="lineTypes"
        />
      </div>

      <div class="col-auto row items-center top-1em">
        <label class="col-3 text-right">透明度：</label>
        <q-slider
          class="col-8"
          dense
          v-model="lineOpacity"
          :min="0"
          :max="1"
          :step="0.01"
          label
          :label-value="lineOpacity * 100 + '%'"
        />
      </div>

      <div class="col-auto row items-center top-02em">
        <label class="col-3 text-right">宽度：</label>
        <q-input
          class="col-8"
          dense
          outlined
          v-model.number="lineWidth"
          type="number"
        />
      </div>

      <div class="group-btn-div">
        <q-btn color="primary" class="group-btn" @click="saveSetting"
          >应用</q-btn
        >
      </div>
    </div>
    <mapbox-measure
      v-if="isPlaneMode"
      :measureSetting="measureSetting"
      :measureMode="measureMode"
      :unit="unit"
      :deleteCount="deleteCount"
      @results="getResults"
    ></mapbox-measure>
    <cesium-measure
      v-else
      :measureSetting="measureSetting"
      :measureMode="measureMode"
      :unit="unit"
      :deleteCount="deleteCount"
      @results="getResults"
    ></cesium-measure>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import {
  mdiMapMarkerPath,
  mdiChartAreaspline,
  mdiDelete
} from '@quasar/extras/mdi-v4'
import { MapTypeChanageMixin } from '@mapgis/pan-spatial-map-store'
import MapboxMeasure from './MapboxMeasure.vue'
import CesiumMeasure from './CesiumMeasure.vue'

@Component({ name: 'MpMeasure', components: { MapboxMeasure, CesiumMeasure } })
export default class MpMeasure extends Mixins(MapTypeChanageMixin) {
  private measureModes = {
    measureLength: 'measure-length',
    measureArea: 'measure-area'
  }

  private buttons = [
    {
      icon: mdiMapMarkerPath,
      type: 'primary',
      tip: '长度测量',
      click: this.toggleMeasureLength.bind(this)
    },
    {
      icon: mdiChartAreaspline,
      type: 'primary',
      tip: '面积测量',
      click: this.toggleMeasureArea.bind(this)
    },
    {
      icon: mdiChartAreaspline,
      type: 'primary',
      tip: '高级设置',
      click: this.showAdvancedSettings.bind(this)
    },
    {
      icon: mdiDelete,
      type: 'primary',
      tip: '删除',
      click: this.toggleDelete.bind(this)
    }
  ]

  private unit = '千米'

  private units = ['m', 'km', '米', '千米']

  private mode: string = this.measureModes.measureLength

  private clickCount = 0

  private measureMode: Record<string, any> = {
    mode: this.mode,
    clickCount: this.clickCount
  }

  private deleteCount = 0

  private measure: any = null

  private results: Record<string, any> = {
    planeLength: '0米',
    ellipsoidLength: '0米',
    planePerimeter: '0米',
    planeArea: '0平方米',
    ellipsoidPerimeter: '0米',
    ellipsoidArea: '0平方米'
  }

  private showSetting = false

  private lineColor = '#3bb2d0'

  private lineType = '实线'

  private lineTypes = ['实线', '虚线']

  private lineOpacity = 1

  private lineWidth = 1

  private textType = '宋体'

  private textTypes = ['宋体', '楷体', '微软雅黑']

  private textColor = '#CC3333'

  private textSize = '12'

  private measureSetting: Record<string, any> = {
    lineColor: this.lineColor,
    lineType: this.lineType,
    lineOpacity: this.lineOpacity,
    lineWidth: this.lineWidth,
    textType: this.textType,
    textColor: this.textColor,
    textSize: this.textSize
  }

  @Watch('isPlaneMode', { deep: true })
  changeMaplibType() {
    const { style } = (this.$refs.measureContainer as HTMLElement)
      .parentElement as HTMLElement
    if (!this.isPlaneMode) {
      style.width = '50vh'
      style.height = '6vh'
    } else {
      style.width = '50vh'
      style.height = '60vh'
    }
  }

  mounted() {
    this.changeMaplibType()
  }

  toggleMeasureLength() {
    this.showSetting = false
    this.clickCount += 1
    if (this.mode !== this.measureModes.measureLength) {
      this.mode = this.measureModes.measureLength
    }
    this.units = ['m', 'km', '米', '千米']
    if (!this.units.includes(this.unit)) {
      this.unit = '千米'
    }
    this.measureMode = {
      mode: this.mode,
      clickCount: this.clickCount
    }
  }

  toggleMeasureArea() {
    this.showSetting = false
    this.clickCount += 1
    if (this.mode !== this.measureModes.measureArea) {
      this.mode = this.measureModes.measureArea
    }
    this.units = ['m2', 'km2', '平方米', '平方千米']
    if (!this.units.includes(this.unit)) {
      this.unit = '平方千米'
    }
    this.measureMode = {
      mode: this.mode,
      clickCount: this.clickCount
    }
  }

  toggleDelete() {
    this.deleteCount += 1
  }

  showAdvancedSettings() {
    this.showSetting = true
  }

  /**
   * 修改绘制图层的样式
   */
  saveSetting() {
    this.measureSetting = {
      lineColor: this.lineColor,
      lineType: this.lineType,
      lineOpacity: this.lineOpacity,
      lineWidth: this.lineWidth,
      textType: this.textType,
      textColor: this.textColor,
      textSize: this.textSize
    }
  }

  getResults(val: Record<string, any>) {
    this.results = { ...this.results, ...val }
  }
}
</script>

<style scoped>
.mapbox-measure-wrapper {
}

.group-title {
  border-bottom: 1px solid black;
}

.group-btn-div {
  width: 100%;
  text-align: center;
  margin-top: 0.5em;
}

.group-btn {
  min-width: 3em;
  margin-right: 0.5em;
}

.content-subTitle-div {
  margin-top: 0.5em;
  text-align: center;
}

.top-02em {
  margin-top: 0.2em;
}

.top-1em {
  margin-top: 1em;
}
</style>
