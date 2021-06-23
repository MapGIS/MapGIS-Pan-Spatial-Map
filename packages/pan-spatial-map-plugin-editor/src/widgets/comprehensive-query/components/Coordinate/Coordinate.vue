<template>
  <div class="coordinate-container">
    <a-space direction="vertical" style="flex: 1">
      <a-row>
        <label>坐标系</label>
      </a-row>
      <a-row>
        <a-select v-model="crs" style="width: 100%;">
          <a-select-option v-for="item in crsOptions" :key="item" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </a-row>
      <a-row>
        <label>单位</label>
      </a-row>
      <a-row>
        <a-select :options="typeOptions" v-model="type" style="width: 100%;" />
      </a-row>
      <a-row type="flex" :gutter="[10, 0]" align="middle">
        <a-col flex="auto"><label>X坐标</label></a-col>
        <a-col style="display: flex; align-items: center;">
          <a-switch size="small" v-model="pickable" />
          <span style="padding-left: 8px;">鼠标拾取</span>
        </a-col>
      </a-row>
      <a-row v-if="type === 'd'">
        <a-input
          type="number"
          v-model="coordDecimal[0]"
          @change="onDecimalCoordChanged"
        />
      </a-row>
      <a-row v-else type="flex" :gutter="[10, 0]" align="middle">
        <a-col :span="6">
          <a-input
            type="number"
            v-model="coordDMS[0][0]"
            @change="onDMSCoordChanged"
          />
        </a-col>
        <a-col :span="2">度</a-col>
        <a-col :span="6">
          <a-input
            type="number"
            v-model="coordDMS[0][1]"
            @change="onDMSCoordChanged"
          />
        </a-col>
        <a-col :span="2">分</a-col>
        <a-col :span="6">
          <a-input
            type="number"
            v-model="coordDMS[0][2]"
            @change="onDMSCoordChanged"
          />
        </a-col>
        <a-col :span="2">秒</a-col>
      </a-row>
      <a-row>
        <a-col><label>Y坐标</label></a-col>
      </a-row>
      <a-row v-if="type === 'd'">
        <a-input
          type="number"
          v-model="coordDecimal[1]"
          @change="onDecimalCoordChanged"
        />
      </a-row>
      <a-row v-else type="flex" :gutter="[10, 0]" align="middle">
        <a-col :span="6">
          <a-input
            type="number"
            v-model="coordDMS[1][0]"
            @change="onDMSCoordChanged"
          />
        </a-col>
        <a-col :span="2">度</a-col>
        <a-col :span="6">
          <a-input
            type="number"
            v-model="coordDMS[1][1]"
            @change="onDMSCoordChanged"
          />
        </a-col>
        <a-col :span="2">分</a-col>
        <a-col :span="6">
          <a-input
            type="number"
            v-model="coordDMS[1][2]"
            @change="onDMSCoordChanged"
          />
        </a-col>
        <a-col :span="2">秒</a-col>
      </a-row>
      <a-row type="flex" :gutter="[10, 0]" align="middle">
        <a-col flex="auto"><label>比例尺</label></a-col>
        <a-col style="display: flex; align-items: center;">
          <a-switch size="small" v-model="frameable" />
          <span style="padding-left: 8px;">计算图幅</span>
        </a-col>
      </a-row>
      <a-row>
        <a-select :options="scaleArray" v-model="scale" style="width: 100%;" />
      </a-row>
      <a-row>
        <label v-show="frameNo" class="frame-text">图幅号：{{ frameNo }}</label>
      </a-row>
      <a-row>
        <a-button
          type="primary"
          @click="onLocate"
          style="width: 100%; margin-top: 10px;"
          :disabled="coordDecimal[0].length == 0 || coordDecimal[1].length == 0"
        >
          坐标定位
        </a-button>
      </a-row>
    </a-space>
    <template v-if="active">
      <coordinate-mapbox
        v-if="is2DMapMode"
        :frame-feature="frameFeature"
        :pickable="pickable"
        :coordinate="coordInDefaultCRS"
        :center="center"
        :highlight-style="highlightStyle"
        @picked-coordinate="onPickedCoordinate"
      ></coordinate-mapbox>
      <coordinate-cesium
        v-else
        :frame-feature="frameFeature"
        :pickable="pickable"
        :coordinate="coordInDefaultCRS"
        :center="center"
        :highlight-style="highlightStyle"
        @picked-coordinate="onPickedCoordinate"
      ></coordinate-cesium>
    </template>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Watch,
  Mixins,
  Model,
  Prop,
  Emit
} from 'vue-property-decorator'
import { AppMixin, Objects, Feature } from '@mapgis/web-app-framework'
import {
  api,
  baseConfigInstance,
  ProjectionTransformationUtil
} from '@mapgis/pan-spatial-map-store'
import CoordinateMapbox from './CoordinateMapbox.vue'
import CoordinateCesium from './CoordinateCesium.vue'

@Component({
  name: 'MpCoordinate',
  components: { CoordinateMapbox, CoordinateCesium }
})
export default class MpCoordinate extends Mixins(AppMixin) {
  @Prop()
  readonly active!: boolean

  @Emit()
  change(val: Feature.FeatureGeoJSON | null) {}

  // 底图坐标系
  private defaultCrs = baseConfigInstance.config.projectionName

  // 坐标系列表
  private crsOptions = baseConfigInstance.config.commonProjection.split(',')

  // 坐标系
  private crs = this.defaultCrs

  // 坐标单位列表
  private typeOptions = [
    { label: '十进制', value: 'd' },
    { label: '度分秒', value: 'dms' }
  ]

  // 坐标单位
  private type = 'd'

  // 是否可拾取
  private pickable = false

  // 底图坐标
  private coordInDefaultCRS = []

  // 平移中心点
  private center = []

  // 用户坐标
  private coordDecimal = ['', '']

  // 用户坐标度分秒
  private coordDMS = [
    ['', '', ''],
    ['', '', '']
  ]

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

  // 是否计算图幅
  private frameable = false

  private frameNo = ''

  private frameFeature: Record<string, any> = {}

  private frameConfig = {
    ip: '',
    port: '',
    name: '',
    gdbp: ''
  }

  private get highlightStyle() {
    return baseConfigInstance.config.colorConfig
  }

  @Watch('active', { immediate: true })
  activeChange(val) {
    if (!val) {
      this.clear()
    }
  }

  @Watch('frameable')
  frameableChange() {
    if (!this.frameable) {
      this.frameNo = ''
      this.frameFeature = {}
    }
  }

  async mounted() {
    this.frameConfig = await api.getConfig('sheet')
  }

  private async frameNochange(val: string) {
    if (val) {
      const {
        data: { XMin, YMin, XMax, YMax }
      } = await api.getFrameExtentByNo(
        this.frameConfig.ip,
        this.frameConfig.port,
        val,
        baseConfigInstance.config.projectionName,
        baseConfigInstance.config.projectionName
      )
      this.frameFeature = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: this.frameNo },
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
      this.change(this.frameFeature)
    }
  }

  private async onLocate() {
    let xTemp = this.coordDecimal[0]
    let yTemp = this.coordDecimal[1]

    if (this.crs !== this.defaultCrs) {
      // 底图和用户选择的坐标系不一样
      const { data } = await ProjectionTransformationUtil.projectPoint(
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
    this.center = [Number(xTemp), Number(yTemp)]

    if (this.frameable) {
      this.getFrameNo()
    } else {
      this.frameFeature = {}

      this.change(this.frameFeature)
    }
  }

  private onDecimalCoordChanged() {
    const x = this.coordDecimal[0]
    const y = this.coordDecimal[1]

    const xx = Objects.AngleConvert.dToDMS(x)
    this.coordDMS[0][0] = xx.d?.toString()
    this.coordDMS[0][1] = xx.m?.toString()
    this.coordDMS[0][2] = xx.s?.toString()
    const yy = Objects.AngleConvert.dToDMS(y)
    this.coordDMS[1][0] = yy.d.toString()
    this.coordDMS[1][1] = yy.m?.toString()
    this.coordDMS[1][2] = yy.s?.toString()
  }

  private onDMSCoordChanged() {
    const xDFM = this.coordDMS[0]
    const x = Objects.AngleConvert.dmsToD(
      Number(xDFM[0]),
      Number(xDFM[1]),
      Number(xDFM[2])
    )
    const yDFM = this.coordDMS[1]
    const y = Objects.AngleConvert.dmsToD(
      Number(yDFM[0]),
      Number(yDFM[1]),
      Number(yDFM[2])
    )

    this.coordDecimal = [x.toString(), y.toString()]
  }

  // 地图点击回调方法
  private async onPickedCoordinate(val: number[], is2D) {
    if (this.is2DMapMode !== is2D) {
      return
    }
    const [lng, lat] = val

    // 临时修改图上坐标，让标注可以跟随拾取位置移动，后面点击定位按钮后，会再次计算该值
    this.coordInDefaultCRS = [lng, lat]

    let x = lng.toString()
    let y = lat.toString()
    if (this.crs !== this.defaultCrs) {
      // 底图和用户选择的坐标系不一样
      const { data } = await ProjectionTransformationUtil.transPoint(
        [[lng, lat]],
        this.defaultCrs,
        this.crs
      )
      if (data.Code === 1) {
        x = (data.Data[0].x as number).toString()
        y = (data.Data[0].y as number).toString()
      }
    }
    this.coordDecimal = [Number(x), Number(y)]

    const xx = Objects.AngleConvert.dToDMS(x)
    this.coordDMS[0][0] = xx.d.toString()
    this.coordDMS[0][1] = xx.m?.toString()
    this.coordDMS[0][2] = xx.s?.toString()
    const yy = Objects.AngleConvert.dToDMS(y)
    this.coordDMS[1][0] = yy.d.toString()
    this.coordDMS[1][1] = yy.m?.toString()
    this.coordDMS[1][2] = yy.s?.toString()
  }

  // 计算图幅号
  private async getFrameNo() {
    const {
      data: { frameNo }
    } = await api.getFrameNoByCoord(
      this.frameConfig.ip,
      this.frameConfig.port,
      this.coordInDefaultCRS[0],
      this.coordInDefaultCRS[1],
      this.scale,
      this.crs,
      baseConfigInstance.config.projectionName
    )
    this.frameNo = frameNo
    this.frameNochange(frameNo)
  }

  // 清除
  private clear() {
    this.pickable = false
    this.frameNo = ''
    this.frameFeature = {}
    this.coordInDefaultCRS = []
    this.center = []
  }
}
</script>

<style lang="less">
.coordinate-container {
  display: flex;
  padding: 10px 3px 0 3px;
  .frame-text {
    color: @primary-color;
  }
  .ant-input {
    padding: 4px 2px;
  }
}
</style>
