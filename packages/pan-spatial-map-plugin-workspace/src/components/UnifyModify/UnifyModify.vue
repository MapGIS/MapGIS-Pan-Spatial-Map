<template>
  <div class="unify-modify">
    <div
      v-for="key in Object.keys(info)"
      :key="key"
      class="row items-center top-02em"
    >
      <label class="col-4">{{ getShowKey(key) }}</label>
      <q-select
        v-if="key === 'FillMode'"
        class="col-7"
        dense
        outlined
        v-model="info.FillMode"
        :options="fillModes"
        emit-value
        map-options
      />
      <q-select
        v-else-if="key === 'OverMethod'"
        class="col-7"
        dense
        outlined
        v-model="info.OverMethod"
        :options="overMethods"
        emit-value
        map-options
      />
      <q-input
        v-else-if="key.toLocaleLowerCase().includes('color')"
        class="col-7"
        dense
        outlined
        v-model="info[key]"
        type="number"
      >
        <template v-slot:append>
          <q-icon name="colorize" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-color
                v-model="tempColor"
                default-view="palette"
                format-model="hex"
                @change="getColorNo(key)"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-input
        v-else
        class="col-7"
        dense
        outlined
        v-model="info[key]"
        type="number"
        min="1"
        @focus="showSymbol(key)"
      />
    </div>
    <div class="row items-center top-02em">
      <div style="width:100%;text-align: center">
        <q-btn color="primary" label="确定" @click="sureClick"> </q-btn>
      </div>
    </div>
    <mp-window-wrapper :visible="showSymbolWin">
      <mp-window
        title="选择符号"
        :width="300"
        :height="400"
        :theme-style="themeStyle"
        :visible.sync="showSymbolWin"
        :position="'top'"
      >
        <template>
          <mp-symbol :queryParams="unifyModifyParams" @symbolNo="getSymbolNo" />
        </template>
      </mp-window>
    </mp-window-wrapper>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch, Prop } from 'vue-property-decorator'
import { ThemeStyleMixin } from '@mapgis/web-app-framework'
import {
  ResultSetMixin,
  queryFeaturesInstance,
  queryArcgisInfoInstance,
  igsFeatureModifyInstance,
  utilInstance
} from '@mapgis/pan-spatial-map-store'
const { IDocument, Layer } = require('@mapgis/webclient-store')
const { LayerType, SubLayerType } = Layer
import MpSymbol from './Symbol.vue'
import { Notify } from 'quasar'

@Component({
  name: 'MpUnifyModify',
  components: { MpSymbol }
})
export default class MpUnifyModify extends Mixins(
  ThemeStyleMixin,
  ResultSetMixin
) {
  @Prop(Object) readonly unifyModifyParams!: Record<string, any>

  private infoType = 3

  private info: Record<string, any> = {}

  private fillModes = [
    {
      label: '常规填充',
      value: 0
    },
    {
      label: '线性渐变填充',
      value: 1
    },
    {
      label: '矩形渐变填充',
      value: 2
    },
    {
      label: '圆形渐变填充',
      value: 3
    }
  ]

  private overMethods = [
    {
      label: '覆盖',
      value: 0
    },
    {
      label: '透明',
      value: 1
    }
  ]

  private showSymbolWin = false

  private tempColor = ''

  @Watch('unifyModifyParams', { deep: true })
  async changeParams() {
    //console.log(this.unifyModifyParams)
    await this.queryFeatures(1)
  }

  async mounted() {
    await this.queryFeatures(1)
  }

  async queryFeatures(pageCount) {
    if (
      !this.unifyModifyParams ||
      Object.keys(this.unifyModifyParams).length < 1
    ) {
      return
    }
    const {
      subtype,
      ip,
      port,
      serverName,
      layerIndex,
      serverUrl
    } = this.unifyModifyParams
    if (subtype === SubLayerType.IgsVectorLayer) {
      //地图文档的图层
      const result = await queryFeaturesInstance.query({
        ip,
        port: port.toString(),
        f: 'json',
        cursorType: 'cursorType',
        page: 0,
        pageCount,
        docName: serverName,
        layerIdxs: layerIndex,
        IncludeWebGraphic: true,
        IncludeGeometry: false
      })
      //console.log(result)
      const graphic = result.SFEleArray[0].GraphicInfo
      this.infoType = graphic.InfoType
      if (graphic.InfoType == 1) {
        this.info = graphic.PntInfo
      } else if (graphic.InfoType == 2) {
        this.info = graphic.LinInfo
      } else if (graphic.InfoType == 3) {
        this.info = graphic.RegInfo
      }
      return result
    }
  }

  getShowKey(key) {
    let showKey = key
    if (this.infoType == 1) {
      switch (key) {
        case 'SymID':
          showKey = '符号ID'
          break
        case 'SymHeight':
          showKey = '子图高'
          break
        case 'SymWidth':
          showKey = '子图宽'
          break
        case 'Angle':
          showKey = '子图角度'
          break
        case 'Color':
          showKey = '子图颜色'
          break
        case 'Space':
          showKey = '间隔值'
          break
        default:
          showKey = key
          break
      }
    } else if (this.infoType == 2) {
      switch (key) {
        case 'LinWidth':
          showKey = '线宽'
          break
        case 'Color':
          showKey = '线颜色'
          break
        case 'LinStyleID':
          showKey = '线样式'
          break
        case 'LinStyleID2':
          showKey = '线样式2'
          break
        case 'Xscale':
          showKey = 'X比例'
          break
        case 'Yscale':
          showKey = 'Y比例'
          break
        default:
          showKey = key
          break
      }
    } else if (this.infoType == 3) {
      switch (key) {
        case 'PatID':
          showKey = '填充图案ID'
          break
        case 'FillMode':
          showKey = '填充模式'
          break
        case 'FillColor':
          showKey = '填充颜色'
          break
        case 'EndColor':
          showKey = '结束填充颜色'
          break
        case 'PatHeight':
          showKey = '填充图案高度'
          break
        case 'PatWidth':
          showKey = '填充图案宽度'
          break
        case 'PatAngle':
          showKey = '填充图案角度'
          break
        case 'PatColor':
          showKey = '填充图案颜色'
          break
        case 'OutPenWidth':
          showKey = '填充图案笔宽'
          break
        case 'OverMethod':
          showKey = '覆盖方式'
          break
        case 'Transparency':
          showKey = '透明度'
          break
        default:
          showKey = key
          break
      }
    }
    return showKey
  }

  showSymbol(key: string) {
    if (key === 'SymID' || key === 'PatID') {
      this.showSymbolWin = true
    }
  }

  getSymbolNo(val) {
    if (this.info.SymID !== undefined) {
      this.info.SymID = val
    } else if (this.info.PatID !== undefined) {
      this.info.PatID = val
    }
  }

  async getColorNo(key) {
    //console.log(this.tempColor)
    const color = utilInstance.colorRGBtoHex(this.tempColor)
    const { ip, port } = this.unifyModifyParams
    const res = await igsFeatureModifyInstance.getColorNo({
      ip,
      port,
      color: this.tempColor
    })
    //console.log(res)
    this.info[key] = res.value
  }

  async sureClick() {
    const result = await this.queryFeatures(10000)
    //console.log(result)
    if (result && result.TotalCount > 0) {
    }
    const graphic = result.SFEleArray[0].GraphicInfo
    let infoName = ''
    if (graphic.InfoType == 1) {
      infoName = 'PntInfo'
    } else if (graphic.InfoType == 2) {
      infoName = 'LinInfo'
    } else if (graphic.InfoType == 3) {
      infoName = 'RegInfo'
    }
    if (result && result.TotalCount > 0) {
      for (var i = 0; i < result.SFEleArray.length; i++) {
        result.SFEleArray[i].GraphicInfo[infoName] = this.info
      }
    }
    const { ip, port, gdbps } = this.unifyModifyParams
    const res = await igsFeatureModifyInstance.editFeature({
      ip,
      port,
      featureSet: result,
      gdbp: gdbps,
      updateAttribute: false,
      updateGeometry: false
    })
    //console.log(res)
    if (res.success) {
      Notify.create({
        message: '修改成功',
        timeout: 1000,
        position: 'center'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.unify-modify {
  margin: 0.5em;
}
.table {
  margin-right: 2em;
  height: 11em;
}
.top-02em {
  margin-top: 0.2em;
}
</style>
