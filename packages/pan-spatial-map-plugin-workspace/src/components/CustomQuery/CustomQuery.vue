<template>
  <div class="custom-query">
    <a-row :gutter="30">
      <a-col :span="12">
        <b>字段信息</b>
      </a-col>
      <a-col :span="12">
        <b>运算符</b>
      </a-col>
    </a-row>
    <a-row class="flex_1" :gutter="30">
      <a-col :span="12" class="fit-height">
        <div class="scroll-table">
          <a-table
            size="middle"
            :pagination="false"
            :columns="feildTableColumn"
            :data-source="fieldTableData"
            :rowKey="
              (record, index) => {
                return index
              }
            "
            :customRow="
              record => {
                return {
                  on: {
                    click: event => clickFieldTabel(record)
                  }
                }
              }
            "
          >
          </a-table>
        </div>
      </a-col>
      <a-col :span="12" class="fit-height buttons-container">
        <a-button
          v-for="symbol in symbols"
          type="primary"
          :key="symbol"
          class="button-customer-container"
          @click="addSqlStr(symbol)"
          >{{ symbol }}</a-button
        >
      </a-col>
    </a-row>
    <a-row :gutter="30" style="margin-top:10px">
      <a-col :span="12">
        <a-row :gutter="8">
          <a-col :span="12">
            <a-button class="fit-width" type="primary" @click="getValue">
              获取属性值
            </a-button>
          </a-col>
          <a-col :span="12">
            <a-input-number class="fit-width" v-model="valueSize" :min="1" />
          </a-col>
        </a-row>
      </a-col>
      <a-col :span="12">
        <a-row :gutter="8">
          <a-col :span="10">
            <b>输入查询条件</b>
          </a-col>
          <a-col :span="7">
            <a-button class="fit-width" type="primary" @click="handleSureClick">
              确定
            </a-button>
          </a-col>
          <a-col :span="7">
            <a-button class="fit-width" type="danger" @click="searchText = ''">
              清除
            </a-button>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
    <a-row class="flex_1" :gutter="30">
      <a-col :span="12" class="fit-height">
        <div class="scroll-table">
          <a-table
            size="middle"
            :pagination="false"
            :columns="valueTableColumn"
            :data-source="valueTableData"
            :rowKey="
              (record, index) => {
                return index
              }
            "
            :customRow="
              record => {
                return {
                  on: {
                    click: event => clickValueTable(record)
                  }
                }
              }
            "
          >
          </a-table>
        </div>
      </a-col>
      <a-col :span="12" class="fit-height">
        <a-textarea
          class="fit-width fit-height"
          v-model="searchText"
          placeholder="请选择条件"
          :auto-size="false"
        />
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch, Prop } from 'vue-property-decorator'
import { WidgetMixin, LayerType } from '@mapgis/web-app-framework'
import {
  ResultSetMixin,
  queryFeaturesInstance,
  queryArcgisInfoInstance
} from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpCustomQuery',
  components: {}
})
export default class MpCustomQuery extends Mixins(WidgetMixin, ResultSetMixin) {
  @Prop(Object) readonly queryParams!: Record<string, any>

  symbols = [
    '+',
    '-',
    '*',
    '/',
    '=',
    '%',
    '>=',
    '<=',
    '>',
    '<',
    '!=',
    'like',
    'and',
    'or',
    'not'
  ]

  symbol = ''

  fieldTableData: Record<string, any>[] = []

  feildTableColumn = [
    {
      title: '字段名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type'
    }
  ]

  valueTableData: Record<string, any>[] = []

  valueTableColumn = [
    {
      title: '属性值',
      dataIndex: 'value',
      key: 'value'
    }
  ]

  fieldTypeCN = {
    BYTE: '字节数据类型',
    SHORT: '短整型',
    INT: '整型',
    LONG: '长整型',
    FLOAT: '浮点型',
    DOUBLE: '双精度型',
    STRING: '字符串类型',
    BINARY: '二进制类型',
    BOOLEAN: '布尔类型',
    GEOMETRY: '几何类型',
    TIMESTAMP: '时间戳',
    TIME: '时间类型',
    DATE: '日期类型'
  }

  valueSize = 300

  searchText = ''

  fieldCurrentRow: Record<string, any> = {}

  @Watch('queryParams', { deep: true })
  changeQueryParams() {
    console.log(this.queryParams)
    this.init()
  }

  mounted() {
    this.init()
  }

  // 初始化属性表格
  async init() {
    if (!this.queryParams || Object.keys(this.queryParams).length < 1) {
      return
    }
    const { tables } = this.queryParams
    const layer = tables.length > 0 ? tables[0] : this.queryParams
    const { layerIndex, id, ip, port, serverName, serverType, gdbp } = layer
    if (
      serverType === LayerType.IGSMapImage ||
      serverType === LayerType.IGSVector
    ) {
      // 地图文档的图层
      const result = await queryFeaturesInstance.query({
        ip,
        port: port.toString(),
        f: 'json',
        cursorType: 'cursorType',
        page: 0,
        pageCount: 1,
        docName: serverName,
        layerIdxs: layerIndex,
        gdbp
      })
      console.log(result)
      const {
        AttStruct: { FldName, FldType }
      } = result

      this.fieldTableData = FldName.map((item, index) => ({
        name: item,
        type: FldType[index]
      })).map(({ name, type }) => ({
        name,
        type: this.fieldTypeCN[type.toUpperCase()]
          ? this.fieldTypeCN[type.toUpperCase()]
          : type.toUpperCase()
      }))
      console.log(this.fieldTableData)
    }
    //  TODO:此段代码请勿删除，该版本暂未适配ArcgisLayer，后续已此段代码作为参考
    /* else if (subtype === SubLayerType.RasterArcgisLayer) {
      // arcgis图层
      const result = await queryArcgisInfoInstance.getArcGISlayerFileds({
        f: 'json',
        serverUrl,
        layerIndex
      })
      console.log(result)
      this.fieldTableData = result.fields
        .map((item, index) => ({
          name: item.name,
          type: item.type
        }))
        .map(({ name, type }) => ({
          name,
          type: this.fieldTypeCN[type.toUpperCase()]
            ? this.fieldTypeCN[type.toUpperCase()]
            : type.toUpperCase()
        }))
      console.log(this.fieldTableData)
    } */
  }

  // 点击字段表格行
  async clickFieldTabel(row) {
    console.log(row)
    this.addSqlStr(row.name)
    this.fieldCurrentRow = row
    await this.getValue()
  }

  // 点击属性值表格行
  clickValueTable(row) {
    console.log(row)
    const { value } = row
    this.addSqlStr(value)
  }

  // 获取属性值
  async getValue() {
    const { name } = this.fieldCurrentRow
    if (!name) {
      return
    }
    const { tables } = this.queryParams
    const layer = tables.length > 0 ? tables[0] : this.queryParams
    const { layerIndex, id, ip, port, serverName, serverType, gdbp } = layer
    if (
      serverType === LayerType.IGSMapImage ||
      serverType === LayerType.IGSVector
    ) {
      const result = await queryFeaturesInstance.query({
        ip,
        port: port.toString(),
        f: 'json',
        cursorType: 'cursorType',
        page: 0,
        pageCount: Number(this.valueSize),
        docName: serverName,
        layerIdxs: layerIndex,
        gdbp
      })
      console.log(result)
      const { SFEleArray: features } = result
      const index = this.fieldTableData.findIndex(
        x => x === this.fieldCurrentRow
      )
      const values = Array.from(
        new Set(features.map(({ AttValue }) => AttValue[index]))
      ).map(value => ({ value }))
      this.valueTableData = values
    }
    //  TODO:此段代码请勿删除，该版本暂未适配ArcgisLayer，后续已此段代码作为参考
    /* else if (subtype === SubLayerType.RasterArcgisLayer) {
      const result = await queryArcgisInfoInstance.getArcGISlayerFileds({
        f: 'json',
        serverUrl,
        layerIndex,
        outFields: name,
        page: 0,
        pageCount: Number(this.valueSize)
      })
      console.log(result.value)
      const values = Array.from(new Set(result.value.map(value => ({ value }))))
      this.valueTableData = values
    } */
  }

  // 拼接SQL语句
  addSqlStr(str) {
    const {
      fieldCurrentRow: { type: lastFieldType },
      symbols,
      fieldTypeCN: { DOUBLE, INT, LONG }
    } = this
    let { searchText } = this
    // 是否按照符号处理, %比较特殊m, 是作为值跟在like后面的
    const isSymbol = symbols.includes(str) && str !== '%'
    const connectSymbol = ['>=', '<=', '>', '<', '=', '!=', 'like']
    const numberType = [DOUBLE, INT, LONG]
    if (connectSymbol.includes(str)) {
      if (numberType.includes(lastFieldType)) {
        // 是数值类型
        str += ' '
      } else {
        // 非数值类型添加单引号
        str += " ''"
      }
    }
    if (!searchText) {
      searchText = str
    } else if (
      searchText.trim().endsWith("'") && // 单引号结尾
      !isSymbol // 不是符号
    ) {
      // 将值添加到单引号之前
      const arr = searchText.split("'")
      arr[arr.length - 2] += str
      searchText = arr.join("'")
    } else {
      searchText += ` ${str}`
    }
    this.searchText = searchText
  }

  // 确定
  handleSureClick() {
    const params = JSON.parse(JSON.stringify(this.queryParams))
    const { tables } = params
    if (tables.length > 0) {
      tables[0].where = `(${this.searchText})`
    } else {
      params.where = `(${this.searchText})`
    }
    const categoryInfo: IResultSetCategory = {
      ...params,
      tables
    }
    const category = this.addCategory(categoryInfo)
    this.currentCategoryId = category.id
    this.openAttributeTable()
  }
}
</script>

<style lang="less" scoped>
.custom-query {
  display: flex;
  flex-direction: column;
  height: calc(~'100% - 20px');
  width: calc(~'100% - 20px');
  margin: 10px;
  overflow: hidden;
  .flex_1 {
    flex: 1 1 0%;
    margin-top: 10px;
    overflow: hidden;
  }
  .fit-height {
    height: 100%;
  }
  .fit-width {
    width: 100%;
  }

  .scroll-table {
    width: 100%;
    height: 100%;
    overflow: auto;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
  }
  .buttons-container {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    .button-customer-container {
      width: calc(~'25% - 3px');
      margin-right: 4px;
      margin-bottom: 4px;
      &:nth-child(4n) {
        margin-right: 0;
      }
    }
  }
}
</style>
