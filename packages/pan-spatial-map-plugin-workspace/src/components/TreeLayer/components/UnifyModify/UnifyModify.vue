<template>
  <div class="unify-modify-wrapper">
    <a-form
      :label-col="{ span: 9 }"
      :wrapper-col="{ span: 15 }"
      labelAlign="left"
    >
      <a-form-item
        v-for="key in Object.keys(info)"
        :key="key"
        :label="getShowKey(key)"
      >
        <a-select
          class="fill-width"
          v-if="key === 'FillMode'"
          v-model="info.FillMode"
          :options="fillModes"
        >
          <a-select-option
            v-for="{ value, label } in fillModes"
            :key="value"
            :value="value"
          >
            {{ label }}
          </a-select-option>
        </a-select>
        <a-select
          class="fill-width"
          v-else-if="key === 'OverMethod'"
          v-model="info.OverMethod"
          :options="overMethods"
        >
          <a-select-option
            v-for="{ value, label } in overMethods"
            :key="value"
            :value="value"
          >
            {{ label }}
          </a-select-option>
        </a-select>
        <a-input
          v-else-if="key.toLocaleLowerCase().includes('color')"
          v-model="info[key]"
          type="number"
        >
          <span slot="addonAfter">
            <a-popover trigger="click">
              <template slot="content">
                <sketch-picker
                  :value="tempColor"
                  @input="val => getColorNo(val, key)"
                />
              </template>
              <a-icon type="edit" />
            </a-popover>
          </span>
        </a-input>
        <template v-else-if="key === 'OutPenW'">
          <a-row type="flex" justify="space-between" v-for="i in 3" :key="i">
            <a-col>
              <a-input v-model="info[key][i - 1]" class="fill-width" />
            </a-col>
          </a-row>
        </template>
        <a-input-number
          class="fill-width"
          v-else
          v-model="info[key]"
          :min="1"
          @focus="showSymbol(key)"
        />
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 0 }">
        <a-button type="primary" @click="sureClick" class="fill-width">
          确定
        </a-button>
      </a-form-item>
    </a-form>
    <mp-window-wrapper :visible="showSymbolWin">
      <template v-slot:default="slotProps">
        <mp-window
          title="选择符号"
          :width="300"
          :height="400"
          anchor="center-right"
          :horizontalOffset="10"
          :visible.sync="showSymbolWin"
          v-bind="slotProps"
        >
          <template>
            <mp-symbol
              :queryParams="unifyModifyParams"
              @symbolNo="getSymbolNo"
            />
          </template>
        </mp-window>
      </template>
    </mp-window-wrapper>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch, Prop } from 'vue-property-decorator'
import {
  AppMixin,
  LayerType,
  Catalog,
  Feature
} from '@mapgis/web-app-framework'
import { Slider, Sketch, Chrome } from 'vue-color'
import MpSymbol from './Symbol.vue'

@Component({
  name: 'MpUnifyModify',
  components: {
    'mp-symbol': MpSymbol,
    'slider-picker': Slider,
    'sketch-picker': Sketch,
    'chrome-picker': Chrome
  }
})
export default class MpUnifyModify extends Mixins(AppMixin) {
  @Prop(Object) readonly unifyModifyParams!: Record<string, any>

  private form = this.$form.createForm(this, { name: 'coordinated' })

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

  private tempColor = '#000000'

  @Watch('unifyModifyParams', { deep: true })
  async changeParams() {
    const res = await this.queryFeatures(1)
  }

  async mounted() {
    const res = await this.queryFeatures(1)
  }

  async queryFeatures(pageCount) {
    if (
      !this.unifyModifyParams ||
      Object.keys(this.unifyModifyParams).length < 1
    ) {
      return
    }
    const {
      serverType,
      ip,
      port,
      serverName,
      layerIndex
    } = this.unifyModifyParams
    if (serverType === LayerType.IGSMapImage) {
      // 地图文档的图层
      const result = await Feature.FeatureQuery.query({
        ip,
        port: port.toString(),
        f: 'json',
        page: 0,
        pageCount,
        docName: serverName,
        layerIdxs: layerIndex,
        IncludeWebGraphic: true,
        IncludeGeometry: false
      })
      const graphic = result.SFEleArray[0].GraphicInfo
      this.infoType = graphic.InfoType
      if (graphic.InfoType === 1) {
        this.info = graphic.PntInfo
      } else if (graphic.InfoType === 2) {
        this.info = graphic.LinInfo
      } else if (graphic.InfoType === 3) {
        this.info = graphic.RegInfo
      }
      // eslint-disable-next-line consistent-return
      return result
    }
    // eslint-disable-next-line consistent-return
    return {}
  }

  getShowKey(key) {
    let showKey = key
    if (this.infoType === 1) {
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
    } else if (this.infoType === 2) {
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
    } else if (this.infoType === 3) {
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

  async getColorNo(val, key) {
    this.tempColor = val.hex
    const { ip, port } = this.unifyModifyParams
    const res = await Catalog.SystemLibraryCatalog.getColorNo({
      ip,
      port,
      color: this.tempColor
    })
    this.info[key] = res.value
  }

  async sureClick() {
    const result = await this.queryFeatures(10000)
    if (result && result.TotalCount > 0) {
    }
    const graphic = result.SFEleArray[0].GraphicInfo
    let infoName = ''
    if (graphic.InfoType === 1) {
      infoName = 'PntInfo'
    } else if (graphic.InfoType === 2) {
      infoName = 'LinInfo'
    } else if (graphic.InfoType === 3) {
      infoName = 'RegInfo'
    }
    if (result && result.TotalCount > 0) {
      for (let i = 0; i < result.SFEleArray.length; i++) {
        result.SFEleArray[i].GraphicInfo[infoName] = this.info
      }
    }
    const { ip, port, gdbps } = this.unifyModifyParams
    const res = await Feature.FeatureEdit.update({
      ip,
      port,
      featureSet: result,
      gdbp: gdbps,
      updateAttribute: false,
      updateGeometry: false
    })
    if (res.succeed) {
      this.$message.success('修改成功')
    }
  }
}
</script>

<style lang="less" scoped>
.unify-modify-wrapper {
  .fill-width {
    width: 100%;
  }
  .ant-form-item {
    margin-bottom: 8px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
