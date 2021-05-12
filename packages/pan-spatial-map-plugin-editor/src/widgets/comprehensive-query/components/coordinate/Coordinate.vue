<template>
  <div class="coordinate-container">
    <a-checkbox-group v-model="options">
      <div class="coordinate-setting-item">
        <a-checkbox value="showCrs">设置输入坐标系</a-checkbox>
        <div v-show="showCrs" class="input-container">
          <a-select v-model="crs">
            <a-select-option
              v-for="item in crsOptions"
              :key="item"
              :value="item"
            >
              {{ item }}
            </a-select-option>
          </a-select>
        </div>
      </div>
      <div class="coordinate-setting-item">
        <a-checkbox value="showType">设置坐标单位</a-checkbox>
        <div v-show="showType" class="input-container">
          <a-select :options="typeOptions" v-model="type" />
        </div>
      </div>
      <div class="coordinate-setting-item">
        <a-radio-group v-model="way">
          <a-radio value="input">
            输入坐标
          </a-radio>
          <a-radio value="click">
            鼠标拾取
          </a-radio>
        </a-radio-group>
        <a-row v-if="type === 'd'" type="flex" align="middle" :gutter="[0, 10]">
          <a-col :span="8">X坐标：</a-col>
          <a-col :span="16">
            <a-input
              type="number"
              v-model="coordDecimal[0]"
              :disabled="clickWay"
              @change="onDecimalCoordChanged"
            />
          </a-col>
          <a-col :span="8">Y坐标：</a-col>
          <a-col :span="16">
            <a-input
              type="number"
              v-model="coordDecimal[1]"
              :disabled="clickWay"
              @change="onDecimalCoordChanged"
            />
          </a-col>
        </a-row>
        <a-row type="flex" align="middle" :gutter="[0, 10]" v-else>
          <a-col :span="6">X坐标：</a-col>
          <a-col :span="4">
            <a-input
              type="number"
              v-model="coordDMS[0][0]"
              :disabled="clickWay"
              @change="onDMSCoordChanged"
            />
          </a-col>
          <a-col :span="2" class="text-center">度</a-col>
          <a-col :span="4">
            <a-input
              type="number"
              v-model="coordDMS[0][1]"
              :disabled="clickWay"
              @change="onDMSCoordChanged"
            />
          </a-col>
          <a-col :span="2" class="text-center">分</a-col>
          <a-col :span="4">
            <a-input
              type="number"
              v-model="coordDMS[0][2]"
              :disabled="clickWay"
              @change="onDMSCoordChanged"
            />
          </a-col>
          <a-col :span="2" class="text-center">秒</a-col>

          <a-col :span="6">Y坐标：</a-col>
          <a-col :span="4">
            <a-input
              type="number"
              v-model="coordDMS[1][0]"
              :disabled="clickWay"
              @change="onDMSCoordChanged"
            />
          </a-col>
          <a-col :span="2" class="text-center">度</a-col>
          <a-col :span="4">
            <a-input
              type="number"
              v-model="coordDMS[1][1]"
              :disabled="clickWay"
              @change="onDMSCoordChanged"
            />
          </a-col>
          <a-col :span="2" class="text-center">分</a-col>
          <a-col :span="4">
            <a-input
              type="number"
              v-model="coordDMS[1][2]"
              :disabled="clickWay"
              @change="onDMSCoordChanged"
            />
          </a-col>
          <a-col :span="2" class="text-center">秒</a-col>
        </a-row>
      </div>
      <div class="coordinate-setting-item">
        <a-checkbox value="checkSheet">计算图幅</a-checkbox>
        <a-row
          v-show="checkSheet"
          type="flex"
          class="input-container"
          align="middle"
        >
          <a-col :span="8">设置比例尺：</a-col>

          <a-col :span="16">
            <a-select :options="scaleArray" v-model="scale" />
          </a-col>
        </a-row>
      </div>
    </a-checkbox-group>
    <a-divider />
    <div v-show="frameNo" class="coordinate-setting-item">
      图幅号：
      <a-tag color="#87d068">
        {{ frameNo }}
      </a-tag>
    </div>
    <a-row type="flex" justify="space-around" style="margin-top:20px">
      <a-button type="primary" @click="getClipByPoint">坐标定位</a-button>
      <a-button type="primary" @click="clear">清除</a-button>
    </a-row>
    <coordinate-mapbox
      v-if="is2DMapMode"
      :geojson="geojson"
      :bounds="bounds"
      :isClick="clickWay"
      :coordinate="coordInDefaultCRS"
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
import { AppMixin } from '@mapgis/web-app-framework'
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

  @Prop()
  readonly active!: boolean

  private geojson: Record<string, any> = {}

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
  private type = 'd'

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
  private scale = 'Scale_20w'

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

  @Watch('active', { immediate: true })
  activeChange(val) {
    if (!val) {
      this.clear()
    }
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
    this.$emit('change', this.geojson)
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
      this.scale,
      this.crs
    )
    this.frameNo = frameNo
  }

  // 清除
  private clear() {
    this.way = 'input'
    this.frameNo = ''
    this.coordInDefaultCRS = [0, 0]
    this.coordDecimal = ['', '']
    this.geojson = {}
  }
}
</script>

<style lang="less">
.coordinate-container {
  padding-top: 10px;
  .ant-checkbox-group {
    .coordinate-setting-item {
      margin-bottom: 20px;
      &:last-child {
        margin: 0;
      }
      .input-container {
        margin-top: 10px;
      }
      .ant-row-flex {
        .text-center {
          text-align: center;
        }
        .ant-col-4 {
          .ant-input {
            padding: 4px;
          }
        }
      }
    }
    .ant-select,
    .ant-input {
      width: 100%;
    }
    .ant-radio-group {
      margin-bottom: 10px;
    }
  }
}
</style>
