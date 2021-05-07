<template>
  <div class="coordinate column">
    <div class="col-auto column">
      <q-checkbox v-model="options" val="showCrs" label="设置输入坐标系" />
      <div v-show="showCrs" class="col-auto">
        <q-select
          dense
          outlined
          :options="crsOptions"
          v-model="crs"
          class="q-my-xs"
        />
      </div>
    </div>
    <div class="col-auto column">
      <q-checkbox v-model="options" val="showType" label="设置坐标单位" />
      <div v-show="showType" class="col-auto">
        <q-select
          dense
          outlined
          :options="typeOptions"
          v-model="type"
          class="q-my-xs"
        />
      </div>
    </div>
    <div class="col-auto column">
      <div class="col-auto">
        <q-radio v-model="way" val="input" label="输入坐标" />
        <q-radio v-model="way" val="click" label="鼠标拾取" />
      </div>
      <div v-if="type.value === 'd'" class="col-auto row items-center">
        <label class="col-3 text-left">X坐标：</label>
        <q-input
          class="col-9 q-my-xs"
          type="number"
          dense
          outlined
          v-model="coordDecimal[0]"
          :disable="clickWay"
          @change="onDecimalCoordChanged"
        />
        <label class="col-3 text-left">Y坐标：</label>
        <q-input
          class="col-9 q-my-xs"
          type="number"
          dense
          outlined
          v-model="coordDecimal[1]"
          :disable="clickWay"
          @change="onDecimalCoordChanged"
        />
      </div>
      <div v-else class="col-auto row items-center">
        <label class="col-3 text-left">X坐标：</label>
        <input
          class="col-2 q-my-xs"
          type="number"
          dense
          outlined
          v-model="coordDMS[0][0]"
          :readonly="clickWay"
          @change="onDMSCoordChanged"
        />
        <label class="col-1 text-center">度</label>
        <input
          class="col-2 q-my-xs"
          type="number"
          dense
          outlined
          v-model="coordDMS[0][1]"
          :readonly="clickWay"
          @change="onDMSCoordChanged"
        />
        <label class="col-1 text-center">分</label>
        <input
          class="col-2 q-my-xs"
          type="number"
          dense
          outlined
          v-model="coordDMS[0][2]"
          :readonly="clickWay"
          @change="onDMSCoordChanged"
        />
        <label class="col-1 text-center">秒</label>

        <label class="col-3 text-left">Y坐标：</label>
        <input
          class="col-2 q-my-xs"
          type="number"
          dense
          outlined
          v-model="coordDMS[1][0]"
          :readonly="clickWay"
          @change="onDMSCoordChanged"
        />
        <label class="col-1 text-center">度</label>
        <input
          class="col-2 q-my-xs"
          type="number"
          dense
          outlined
          v-model="coordDMS[1][1]"
          :readonly="clickWay"
          @change="onDMSCoordChanged"
        />
        <label class="col-1 text-center">分</label>
        <input
          class="col-2 q-my-xs"
          type="number"
          dense
          outlined
          v-model="coordDMS[1][2]"
          :readonly="clickWay"
          @change="onDMSCoordChanged"
        />
        <label class="col-1 text-center">秒</label>
      </div>
    </div>
    <div class="col-auto column">
      <div class="col-auto groupTitle">
        <q-checkbox v-model="options" val="checkSheet" label="计算图幅" />
      </div>
      <div v-show="checkSheet" class="col-auto row items-center">
        <label class="col-auto text-left">设置比例尺：</label>
        <q-select
          dense
          outlined
          :options="scaleArray"
          v-model="scale"
          class="col q-my-xs"
        />
      </div>
    </div>
    <div class="col-auto" v-show="frameNo">图幅号：{{ frameNo }}</div>
    <div class="col-auto row justify-around q-pa-sm">
      <q-btn
        :color="themeStyle.color"
        label="坐标定位"
        @click="getClipByPoint"
      />
      <q-btn :color="themeStyle.color" label="清除" @click="clear" />
    </div>
    <coordinate-mapbox
      v-if="is2DMapMode"
      :geojson="geojson"
      :bounds="bounds"
      :isClick="clickWay"
      :coordinate="coordInDefaultCRS"
      :widgetState="widgetState"
      @mapCoordinate="getMapCoordinate"
    ></coordinate-mapbox>
    <coordinate-cesium
      v-else
      :geojson="geojson"
      :bounds="bounds"
      :isClick="clickWay"
      :coordinate="coordInDefaultCRS"
      @mapCoordinate="getMapCoordinate"
    ></coordinate-cesium>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, Watch, Mixins, Model, Prop } from 'vue-property-decorator'
import { AppMixin, WidgetState } from '@mapgis/web-app-framework'
import {
  FeatureGeoJSON,
  utilInstance,
  baseConfigInstance
} from '@mapgis/pan-spatial-map-store'
import CoordinateMapbox from './CoordinateMapbox.vue'
import CoordinateCesium from './CoordinateCesium.vue'

@Component({
  name: 'MpCoordinate',
  components: { CoordinateMapbox, CoordinateCesium }
})
export default class Coordinate extends Mixins(AppMixin) {
  @Model('change', { type: Object, required: false, default: null })
  private value!: FeatureGeoJSON | null

  // 选择的功能项
  public options = ['showCrs', 'showType', 'checkSheet']

  private defaultConfig = baseConfigInstance.config

  // 底图坐标系
  private defaultCrs = this.defaultConfig.projectionName

  // 坐标系列表
  private crsOptions = this.defaultConfig.commonProjection.split(',')

  // 坐标系
  private crs = this.defaultCrs

  // 坐标单位列表
  private typeOptions = [
    { label: '十进制', value: 'd' },
    { label: '度分秒', value: 'dms' }
  ]

  // 坐标单位
  private type = { label: '十进制', value: 'd' }

  // 坐标输入方式
  private way = 'input'

  // 底图坐标
  private coordInDefaultCRS = [0, 0]

  // 用户坐标
  private coordDecimal = ['', '']

  // 用户坐标度分秒
  private coordDMS = [
    ['', '', ''],
    ['', '', '']
  ]

  @Prop({
    type: String,
    default: WidgetState.CLOSED
  })
  readonly widgetState!: string

  @Watch('widgetState')
  private onwidgetStateChanged() {
    if (this.widgetState === WidgetState.DEACTIVE) {
    } else if (this.widgetState === WidgetState.CLOSED) {
      this.clear()
    }
  }

  private onDecimalCoordChanged() {
    const x = this.coordDecimal[0]
    const y = this.coordDecimal[1]
    const xx = utilInstance.coordinateStyleTransformation(x)
    this.coordDMS[0][0] = xx.degree.toString()
    this.coordDMS[0][1] = xx.minute!.toString()
    this.coordDMS[0][2] = xx.second!.toString()
    const yy = utilInstance.coordinateStyleTransformation(y)
    this.coordDMS[1][0] = yy.degree.toString()
    this.coordDMS[1][1] = yy.minute!.toString()
    this.coordDMS[1][2] = yy.second!.toString()

    this.onCoordinateChanged(x, y)
  }

  private onDMSCoordChanged() {
    const xDFM = this.coordDMS[0]
    const x = utilInstance.degreeToDecimal(
      Number(xDFM[0]),
      Number(xDFM[1]),
      Number(xDFM[2])
    )
    const yDFM = this.coordDMS[1]
    const y = utilInstance.degreeToDecimal(
      Number(yDFM[0]),
      Number(yDFM[1]),
      Number(yDFM[2])
    )

    this.coordDecimal = [x.toString(), y.toString()]

    this.onCoordinateChanged(x, y)
  }

  // 坐标变化监听。
  private async onCoordinateChanged(x: number, y: number) {
    let xTemp = x
    let yTemp = y

    if (this.crs !== this.defaultCrs) {
      // 底图和用户选择的坐标系不一样
      const { data } = await utilInstance.transPoint(
        [[Number(xTemp), Number(yTemp)]],
        this.crs,
        this.defaultCrs
      )
      if (data.Code === 1) {
        xTemp = data.Data[0].x
        yTemp = data.Data[0].y
      }
    }

    this.coordInDefaultCRS = [Number(xTemp), Number(yTemp)]
    this.locatate()
  }

  // 比例尺列表
  private scaleArray = [
    { label: '1:5千', value: 'Scale_5000' },
    { label: '1:1万', value: 'Scale_1w' },
    { label: '1:2万5', value: 'Scale_2w5' },
    { label: '1:5万', value: 'Scale_5w' },
    { label: '1:10万', value: 'Scale_10w' },
    { label: '1:20万', value: 'Scale_20w' },
    { label: '1:25万', value: 'Scale_25w' },
    { label: '1:50万', value: 'Scale_50w' },
    { label: '1:100万', value: 'Scale_100w' }
  ]

  // 比例尺
  private scale = { label: '1:20万', value: 'Scale_20w' }

  private frameNo = ''

  private geojson: Record<string, any> = {}

  private bounds: Record<string, any> = {}

  private get showCrs() {
    return this.options.includes('showCrs')
  }

  private get showType() {
    return this.options.includes('showType')
  }

  private get checkSheet() {
    return this.options.includes('checkSheet')
  }

  private get clickWay() {
    return this.way === 'click'
  }

  @Watch('frameNo')
  private async changeFrameNo(val: string) {
    const geoJson: FeatureGeoJSON | null = null
    if (val) {
      const {
        data: { XMin, YMin, XMax, YMax }
      } = await utilInstance.getRectByFrameNo(val)
      this.geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [XMin, YMin],
                  [XMax, YMin],
                  [XMax, YMax],
                  [XMin, YMax],
                  [XMin, YMin]
                ]
              ]
            }
          }
        ]
      }
      this.bounds = {
        xmin: 2 * XMin - XMax,
        ymin: 2 * YMin - YMax,
        xmax: 2 * XMax - XMin,
        ymax: 2 * YMax - YMin
      }
    }
    this.$emit('change', geoJson)
  }

  // 地图点击回调方法
  private async getMapCoordinate(val: number[]) {
    const [lng, lat] = val

    let x = lng.toString()
    let y = lat.toString()
    if (this.crs !== this.defaultCrs) {
      // 底图和用户选择的坐标系不一样
      const { data } = await utilInstance.transPoint(
        [[lng, lat]],
        this.defaultCrs,
        this.crs
      )
      if (data.Code === 1) {
        x = (data.Data[0].x as number).toString()
        y = (data.Data[0].y as number).toString()
      }
    }

    this.coordInDefaultCRS = [Number(x), Number(y)]

    this.coordDecimal = this.coordInDefaultCRS

    const xx = utilInstance.coordinateStyleTransformation(x)
    this.coordDMS[0][0] = xx.degree.toString()
    this.coordDMS[0][1] = xx.minute!.toString()
    this.coordDMS[0][2] = xx.second!.toString()
    const yy = utilInstance.coordinateStyleTransformation(y)
    this.coordDMS[1][0] = yy.degree.toString()
    this.coordDMS[1][1] = yy.minute!.toString()
    this.coordDMS[1][2] = yy.second!.toString()

    this.locatate()

    this.$forceUpdate()
  }

  private locatate() {
    this.getClipByPoint()
  }

  // 计算图幅号
  private async getClipByPoint() {
    const {
      data: { frameNo }
    } = await utilInstance.getClipByPoint(
      this.coordInDefaultCRS[0],
      this.coordInDefaultCRS[1],
      this.scale.value,
      this.crs
    )
    this.frameNo = frameNo
  }

  // 清除
  private clear() {
    this.frameNo = ''
    this.coordInDefaultCRS = [0, 0]
    this.geojson = {}
  }

  private deactivated() {
    this.clear()
  }
}
</script>

<style lang="scss">
.Coordinate {
  .groupTitle {
    border-bottom: 1px solid black;
  }
}
</style>
