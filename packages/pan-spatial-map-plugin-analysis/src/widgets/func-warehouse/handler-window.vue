<template>
  <div class="mp-handler-window">
    <div style="width:100%;overflow-y:auto">
      <template v-if="itemCopy.Parameters">
        <div class="setting-panel">
          <a-space direction="vertical" class="space">
            <a-row v-for="(item, index) in itemCopy.Parameters" :key="index">
              <a-col :span="4" class="col">{{ item.Name }}</a-col>
              <a-col :span="12">
                <!-- 多个fldNameArr -->
                <a-select
                  v-if="item.fldNameArr && item.fldNameArr.length > 0"
                  v-model="item.DefaultValue"
                  :options="item.fldNameArr"
                  :disabled="item.Direction == 1"
                  style="width: 100%;"
                />
                <!-- 时间类型 -->
                <a-date-picker
                  v-else-if="
                    getPageElementType(item.pageElement) === 'Date' ||
                      getPageElementType(item.pageElement) === 'DateTime'
                  "
                  :show-time="
                    getPageElementType(item.pageElement) === 'DateTime'
                  "
                  v-model="item.DefaultValue"
                  style="width: 100%;"
                />
                <!-- 选择类型 -->
                <a-select
                  v-else-if="getPageElementType(item.pageElement) === 'ComBox'"
                  v-model="item.DefaultValue"
                  :options="setComboxOptions(item.pageElement)"
                  style="width: 100%;"
                />
                <!-- checkbox类型 -->
                <a-select
                  v-else-if="item.DataType == 3"
                  v-model="item.DefaultValue"
                  :options="[
                    { label: '是', value: 'true' },
                    { label: '否', value: 'false' }
                  ]"
                  :disabled="item.Direction == 1"
                  style="width: 100%;"
                />
                <!-- 其他类型 -->
                <a-input
                  v-else-if="
                    item.DataType == 1 ||
                      item.DataType == 2 ||
                      item.DataType == 0
                  "
                  :disabled="item.Direction == 1"
                  v-model="item.DefaultValue"
                >
                </a-input>
              </a-col>

              <a-dropdown v-if="hasSelectBtn(item)">
                <a-menu slot="overlay">
                  <a-menu-item
                    v-for="option in selectDataOptions"
                    :key="option.value"
                    @click="selectDataType(option.value, item, index)"
                  >
                    {{ option.label }}
                  </a-menu-item>
                </a-menu>
                <a-button style="margin-left: 8px">
                  选择数据 <a-icon type="down" />
                </a-button>
              </a-dropdown>
            </a-row>
            <a-row>
              <a-button
                type="primary"
                :loading="showLoading"
                @click="doExecuteWorkflow"
                style="float:right"
              >
                执行
              </a-button>
            </a-row>
          </a-space>

          <!-- 选择基础目录树数据 -->
          <mp-window-wrapper :visible="treeVisible">
            <template v-slot:default="slotProps">
              <mp-window
                id="treeSelectId"
                title="目录树数据"
                :width="300"
                :bottom="10"
                :verticalOffset="10"
                :visible.sync="treeVisible"
                anchor="top-center"
                v-bind="slotProps"
              >
                <template>
                  <mp-tree-select @selectedLayer="getSelectedLayer" />
                </template>
              </mp-window>
            </template>
          </mp-window-wrapper>

          <!-- 绘制要素 -->
          <mp-window-wrapper :visible="drawVisible">
            <template v-slot:default="slotProps">
              <mp-window
                id="drawStyleId"
                title="绘制要素"
                :width="300"
                :bottom="10"
                :verticalOffset="10"
                :visible.sync="drawVisible"
                anchor="top-center"
                v-bind="slotProps"
              >
                <template>
                  <mp-draw-style />
                </template>
              </mp-window>
            </template>
          </mp-window-wrapper>

          <!-- 选择要素 -->
          <mp-window-wrapper :visible="elementVisible">
            <template v-slot:default="slotProps">
              <mp-window
                id="elementQueryId"
                title="选择要素"
                :width="300"
                :bottom="10"
                :verticalOffset="10"
                :visible.sync="elementVisible"
                anchor="top-center"
                v-bind="slotProps"
              >
                <template>
                  <mp-element-query />
                </template>
              </mp-window>
            </template>
          </mp-window-wrapper>

          <!-- 选择标注 -->
          <mp-window-wrapper :visible="markerVisible">
            <template v-slot:default="slotProps">
              <mp-window
                id="markerSelectId"
                title="选择标注"
                :width="300"
                :bottom="10"
                :verticalOffset="10"
                :visible.sync="markerVisible"
                anchor="top-center"
                v-bind="slotProps"
              >
                <template>
                  <mp-marker-select />
                </template>
              </mp-window>
            </template>
          </mp-window-wrapper>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { WidgetMixin, Analysis, Feature } from '@mapgis/web-app-framework'
import { baseConfigInstance, utilInstance } from '@mapgis/pan-spatial-map-store'
import * as Zondy from '@mapgis/webclient-es6-service'
import MpTreeSelect from './tree-select.vue'
import MpDrawStyle from './draw-style.vue'
import MpElementQuery from './element-query.vue'
import MpMarkerSelect from './marker-select.vue'

@Component({
  name: 'MpHandlerWindow',
  components: { MpTreeSelect, MpDrawStyle, MpElementQuery, MpMarkerSelect }
})
export default class MpHandlerWindow extends Mixins(WidgetMixin) {
  // 功能属性信息
  @Prop({ type: Object, required: true, default: () => ({}) }) data: object

  // 选择的数据
  private selectDataOptions = [
    { value: '1', label: '目录树数据' },
    { value: '2', label: '交互绘制' },
    { value: '3', label: '选择要素' }
  ]

  // 选择的图层数据，目录树选择回传
  private selectedLayer = {}

  // 基础目录树上已选择的数据
  private layers = []

  // 目录选择的弹窗
  private treeVisible = false

  // 交互绘制的弹窗
  private drawVisible = false

  // 要素选择弹窗控制
  private elementVisible = false

  private selectItem = {}

  private selectItemIndex = -1

  // 选择要素里面的geojson,组件关闭后无法获取，所以放到外面来操作
  private geojsonData = null

  // 选择要素的form表单数据
  private selectFeature = {}

  // 查询要素的结果集
  private queryElement = {}

  private markerVisible = false

  // 是否显示进度条
  private showLoading = false

  private executeParam = null

  private layer: Record<string, string> = {}

  private keys = [
    'center',
    'srcInfo',
    'orgSFClsStr',
    'idsInput',
    'linePoints',
    'strGRegion',
    'strGeometry',
    'FIDs',
    'strPos',
    'fldName',
    'sfGeometry',
    'attStrct',
    'attRows',
    'URL',
    'polygonDotsStr',
    'clsName'
  ]

  private itemCopy = {}

  @Watch('data', { deep: true, immediate: true })
  dataChange(val) {
    this.deleteLayer()
    const item = JSON.parse(JSON.stringify(this.data))
    const arr = item.Parameters || []
    arr.forEach(row => {
      if (this.hasSelectBtn(row)) {
        row.dataSelectType = ''
      }
      if (this.getPageElementType(row.pageElement) === 'ComBox') {
        const element = this.stringToHtmlElement(row.pageElement)
        if (!element) {
          return
        }
        const items = element.getAttribute('comboboxitems').split('fwhouse')
        for (let j = 0; j < items.length; j += 3) {
          if (items[j + 2] === 'true') {
            row.DefaultValue = items[j + 1]
          }
        }
      }
    })
    this.itemCopy = item
    this.resetView()
  }

  /**
   * 动态获取基础目录树上已勾选的三维模型数据
   */
  @Watch('document', { deep: true, immediate: true })
  getLayers() {
    if (!this.document) return
    this.layers = this.document.defaultMap.clone().getFlatLayers()
    console.log(this.layers)
  }

  /**
   * 字符串转html元素
   */
  stringToHtmlElement(divString: string) {
    const eleStr = divString
      .replaceAll('&#xFFFE;', 'fwhouse')
      .replaceAll('&#xFFFF;', 'fwhouse')
    const div = document.createElement('div')
    div.innerHTML = eleStr
    const element = div.childNodes[0]
    return element
  }

  resetView() {
    this.$refs.treeSelect && this.$refs.treeSelect.reset()
    this.$refs.drawStyle && this.$refs.drawStyle.reset()
    this.$refs.elementQuery && this.$refs.elementQuery.reset()
    this.$refs.markerSelect && this.$refs.markerSelect.reset()
    // 选择的图层数据，目录树选择回传
    this.selectedLayer = {}

    // 基础目录树上已选择的数据
    this.layers = []

    // 目录选择的弹窗
    this.treeVisible = false

    // 交互绘制的弹窗
    this.drawVisible = false

    // 要素选择弹窗控制
    this.elementVisible = false

    this.selectItem = {}

    this.selectItemIndex = -1

    // 选择要素里面的geojson,组件关闭后无法获取，所以放到外面来操作
    this.geojsonData = null

    // 选择要素的form表单数据
    this.selectFeature = {}

    // 查询要素的结果集
    this.queryElement = {}

    this.markerVisible = false
  }

  setVisible(bool) {
    this.$emit('update:visible', bool)
  }

  // 判断属性参数是否添加选择数据按钮
  hasSelectBtn(param) {
    let flag = false
    if (param && param.Direction === 0) {
      for (let i = 0; i < this.keys.length; i++) {
        if (param.Name.indexOf(this.keys[i]) >= 0) {
          flag = true
          break
        }
      }
    }
    return flag
  }

  getPageElementType(pageElement: string) {
    const element = this.stringToHtmlElement(pageElement)
    if (!element) {
      return ''
    }
    const type = element.getAttribute('type')
    if (type === 'Date') {
      return 'Date'
    }
    if (type === 'DateTime') {
      return 'DateTime'
    }
    if (type === 'ComBox') {
      return 'ComBox'
    }
    return ''
  }

  // 当输入框为 Combox类型是，设置其下拉框的内容
  setComboxOptions(pageElement: string) {
    const arr = []
    const element = this.stringToHtmlElement(pageElement)
    if (!element) {
      return arr
    }
    const items = element.getAttribute('comboboxitems').split('fwhouse')
    for (let j = 0; j < items.length; j += 3) {
      if (items[j + 2] === 'true') {
        arr.push({
          label: items[j],
          value: items[j + 1]
        })
      }
    }
    return arr
  }

  selectDataType(value, item, index) {
    item.dataSelectType = value
    this.selectItem = item
    this.selectItemIndex = index
    console.log(this.layers)
    switch (value) {
      case '1':
        if (this.layers.length > 0) {
          this.markerVisible = false
          this.elementVisible = false
          this.drawVisible = false
          this.treeVisible = true
        } else {
          this.$message.error('未勾选目录树')
        }
        break
      case '2':
        this.markerVisible = false
        this.treeVisible = false
        this.elementVisible = false
        this.drawVisible = true
        break
      case '3':
        if (this.layers.length > 0) {
          this.markerVisible = false
          this.treeVisible = false
          this.drawVisible = false
          this.elementVisible = true
        } else {
          this.$message.error('未勾选目录树')
        }
        break
      default:
        break
    }
  }

  getSelectedLayer(e) {
    this.selectItem.DefaultValue = e
    this.refreshData(this.selectItem)
  }

  refreshData() {
    const item = this.selectItem
    if (
      item.Name.indexOf('srcInfo') >= 0 &&
      item.Name.indexOf('srcInfo2') < 0
    ) {
      const index = (this.itemCopy.Parameters || []).findIndex(
        row => row.Name === 'desInfo'
      )
      if (index > -1) {
        this.$set(this.itemCopy.Parameters, index, {
          ...this.itemCopy.Parameters[index],
          DefaultValue: `${item.DefaultValue}_${new Date().getTime()}`
        })
      }
    } else if (item.Name.indexOf('clsName') >= 0) {
      const index = (this.itemCopy.Parameters || []).findIndex(
        row => row.Name === 'desClsName'
      )
      if (index > -1) {
        this.$set(this.itemCopy.Parameters, index, {
          ...this.itemCopy.Parameters[index],
          DefaultValue: `${item.DefaultValue}_${new Date().getTime()}`
        })
      }
    }
    this.$set(this.itemCopy.Parameters, this.selectItemIndex, item)
  }

  /**
   * =====================以下是操作选择要素的地图绘制方法，由于组件关闭后无法获取内容，所以在父组件处理=========================
   */
  // 绘制选择要素的回调
  selectFeatureDraw(data) {
    this.selectFeature = data
    // this.map.once('draw.selectionchange', this.drawFinish)
  }

  // 监听图层是否绘制完成
  drawFinish(e) {
    if (e.features[0]) {
      if (!this.geojsonData) {
        this.setQuery(e)
      } else if (
        !this.isObjectValueEqual(
          this.geojsonData.geometry,
          e.features[0].geometry
        )
      ) {
        this.setQuery(e)
      }
    }
  }

  setQuery(e) {
    this.geojsonData = e.features[0] || null
    let geometry
    if (this.selectFeature.queryType) {
      const [x, y] = this.geojsonData.geometry.coordinates
      geometry = new Zondy.Common.Point2D(x, y)
      geometry.nearDis = 0
    } else {
      const bouns = utilInstance.getGeoJsonFeatureBound(this.geojsonData)
      geometry = new Zondy.Common.Rectangle(
        bouns.xmin,
        bouns.ymin,
        bouns.xmax,
        bouns.ymax
      )
    }
    const queryDocName = this.selectFeature.layerSelect.text
    const queryIp = this.selectFeature.layerSelect.ip
    const queryPort = this.selectFeature.layerSelect.port
    const queryIndex = this.selectFeature.networkLayer.index
    const queryGdbp = this.selectFeature.networkLayer.value
    Feature.FeatureQuery.query({
      f: 'json',
      ip: queryIp,
      port: queryPort,
      docName: queryDocName,
      layerIdxs: queryIndex,
      method: 'post',
      geometry
    }).then(res => {
      // TODO: 这里只要LabelDots大于0就行了，不要看老代码里面的
      if (res.LabelDots && res.LabelDots.length > 0) {
        this.queryElement = res
        this.markerVisible = true
      }
    })
    // 删除图层，清除监听，复位数据
    window.setTimeout(() => {
      this.selectFeature.toggleDeleteAll()
      // this.map.off('draw.selectionchange', this.drawFinish)
      this.geojsonData = null
    })
  }

  // 判断对象内容是否相等
  isObjectValueEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
  }

  /**
   * doExecuteWorkflow
   * 执行工作流
   */
  doExecuteWorkflow() {
    const params = []
    this.itemCopy.Parameters.forEach(item => {
      const value = item.DefaultValue
      const id = item.Name
      params.push({
        key: id,
        value
      })
    })
    const flowId = this.data.FlowNo
    params.push({
      ip: this.widgetInfo.config.ip || baseConfigInstance.config.ip,
      port: this.widgetInfo.config.port || baseConfigInstance.config.port,
      key: 'flowId',
      value: flowId
    })
    this.executeParam = params
    this.showLoading = true
    Analysis.WorkflowAnalysis.executeWorkflow({
      ip: this.widgetInfo.config.ip || baseConfigInstance.config.ip,
      port: this.widgetInfo.config.port || baseConfigInstance.config.port,
      flowID: flowId,
      param: params,
      isAsy: false
    })
      .then(guid => {
        this.getStatus(guid)
      })
      .catch(() => {
        this.showLoading = false
        this.$message.error(`执行${this.data.FlowName}失败`)
      })
  }

  getStatus(guid) {}

  dealWithExecuteRes(result) {
    console.log(result)
    if (result.results && result.results.length > 0) {
      // this.map.clearVectorById(this.vectorId)
      const res = result.results[0]
      if (res.DataType === 1) {
        if (res.ParaName && res.Value) {
          const paramName = res.ParaName
          const value = res.Value
          if (this.executeParam) {
            let url
            for (let i = 0; i < this.executeParam.length; i++) {
              if (
                typeof this.executeParam[i].value === 'string' &&
                this.executeParam[i].value.indexOf(value) >= 0
              ) {
                url = this.executeParam[i].value
                break
              }
            }
            if (url) {
              this.addNewServer(url, value)
            }
          }
        }
      }
    }
  }

  // 若工作流执行结果生成新图层，则将图层添加至地图容器中，并用图层树管理
  addNewServer(gdbp, name) {
    console.log(gdbp)
  }

  deleteLayer() {}
}
</script>

<style lang="less" scoped>
.mp-handler-window {
  display: flex;
  flex-direction: column;
  align-items: center;
  .title {
    .space {
      width: 4px;
      height: 25px;
      background: @primary-color;
      margin-right: 8px;
      float: left;
    }
    .label {
      line-height: 25px;
      font-weight: bold;
    }
  }
  .space {
    width: 100%;
  }
  .btn {
    text-align: right;
    margin: 12px 0;
    button {
      margin-left: 8px;
    }
  }
  .col {
    text-align: right;
    line-height: 30px;
    margin-right: 8px;
  }
  .setting-panel {
    display: flex;
    flex-direction: column;
    .ant-divider-horizontal {
      margin: 8px 0;
    }
    .color {
      height: 30px;
      box-shadow: @shadow-1-down;
      border-radius: 3px;
    }
  }
  .ant-table-wrapper {
    width: 400px;
  }
}
</style>
