<template>
  <div class="input-coord-wrapper">
    <div class="col-auto row items-center">
      <label class="col-3 text-right">坐标单位：</label>
      <q-select
        class="col-9"
        dense
        outlined
        v-model="unit"
        :options="units"
        @popup-hide="changeUnit"
      />
    </div>
    <div class="col-auto row items-center top-02em">
      <label class="col-3 text-right">X坐标：</label>
      <q-input
        v-show="unit === '十进制'"
        class="col-9"
        dense
        outlined
        v-model="coord.x"
        type="number"
      />
      <div v-show="unit === '度分秒'">
        <input v-model="xDFM.d" type="number" filled class="width-4em" />
        <span>度</span>
        <input v-model="xDFM.f" type="number" filled class="width-4em" />
        <span>分</span>
        <input v-model="xDFM.m" type="number" filled class="width-4em" />
        <span>秒</span>
      </div>
    </div>
    <div class="col-auto row items-center top-02em">
      <label class="col-3 text-right">Y坐标：</label>
      <q-input
        v-show="unit === '十进制'"
        class="col-9"
        dense
        outlined
        v-model="coord.y"
        type="number"
      />
      <div v-show="unit === '度分秒'">
        <input v-model="yDFM.d" type="number" filled class="width-4em" />
        <span>度</span>
        <input v-model="yDFM.f" type="number" filled class="width-4em" />
        <span>分</span>
        <input v-model="yDFM.m" type="number" filled class="width-4em" />
        <span>秒</span>
      </div>
    </div>
    <div class="col-auto items-center group-title top-05em">
      <q-checkbox v-model="useTransform" label="设置输入坐标空间参考系" />
    </div>
    <div class="col-auto row items-center" v-show="useTransform">
      <label class="col-3 text-right">参考系：</label>
      <q-select
        class="col-9 top-02em"
        dense
        outlined
        v-model="crsName"
        :options="crsNames"
      />
    </div>
    <div class="group-btn-div">
      <q-btn color="primary" class="group-btn" @click="inputSure">确定</q-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Emit } from 'vue-property-decorator'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import AddMarkerMixin from '../AddMarkerMixin'

export interface XY {
  x: number
  y: number
}

export interface DFM {
  d: number
  f: number
  m: number
}

@Component({ components: {} })
export default class InputCoord extends Mixins(AddMarkerMixin) {
  @Emit('inputCoord')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitTodo(coord: any) {}

  private coord: XY = {
    x: 0,
    y: 0
  }

  private unit = '十进制'

  private units = ['十进制', '度分秒']

  private useTransform = true

  private crsName = 'WGS1984_度'

  private crsNames = ['WGS1984_度', 'Web墨卡托_WGS1984']

  private xDFM: DFM = {
    d: 0,
    f: 0,
    m: 0
  }

  private yDFM: DFM = {
    d: 0,
    f: 0,
    m: 0
  }

  changeUnit() {
    if (this.unit === '十进制') {
      this.coord.x = utilInstance.degreeToDecimal(
        Number(this.xDFM.d),
        Number(this.xDFM.f),
        Number(this.xDFM.m)
      )
      this.coord.y = utilInstance.degreeToDecimal(
        Number(this.yDFM.d),
        Number(this.yDFM.f),
        Number(this.yDFM.m)
      )
    } else if (this.unit === '度分秒') {
      this.xDFM = utilInstance.decimalToDegree(Number(this.coord.x))
      this.yDFM = utilInstance.decimalToDegree(Number(this.coord.y))
    }
  }

  async inputSure() {
    let pointCoords: number[][] = [[Number(this.coord.x), Number(this.coord.y)]]
    if (this.useTransform) {
      // eslint-disable-next-line no-await-in-loop
      pointCoords = await this.transPoints(
        [[Number(this.coord.x), Number(this.coord.y)]],
        this.crsName
      )
    }
    this.emitTodo(pointCoords[0])
  }

  inputCancel() {}
}
</script>

<style scoped>
.input-coord-wrapper {
  min-width: 22em;
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

.top-02em {
  margin-top: 0.2em;
}

.top-05em {
  margin-top: 0.5em;
}

.width-4em {
  width: 4em;
}
</style>
