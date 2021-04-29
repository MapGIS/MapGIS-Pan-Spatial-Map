<template>
  <!-- 属性表 -->
  <mp-window-wrapper :visible="atVisible">
    <mp-window
      title="属性表"
      :visible.sync="atVisible"
      anchor="top-right"
      :verticalOffset="50"
    >
      <div class="thematic-map-attribute-table">
        <row-flex
          :span="[13, 10]"
          justify="space-between"
          class="attribute-table-head"
        >
          <template #label>
            <row-flex label="专题" :span="[4, 20]">
              <a-select :value="subject" @change="onSubjectChange">
                <a-select-option v-for="s in subjectList" :key="s.id">{{
                  s.title
                }}</a-select-option>
              </a-select>
            </row-flex>
          </template>
          <row-flex label="时间" :span="[5, 19]">
            <a-select :value="time" @change="onTimeChange">
              <a-select-option v-for="y in timeList" :key="y">{{
                y
              }}</a-select-option>
            </a-select>
          </row-flex>
        </row-flex>
        <!-- 分页列表 -->
        <a-table
          bordered
          row-key="fid"
          :loading="tableLoading"
          :columns="tableColumns"
          :data-source="tableData"
          :pagination="tablePagination"
          :scroll="{ x: 1000, y: 360 }"
          @change="onTableChange"
        />
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import {
  queryFeaturesInstance,
  FeatureQueryParam,
  ThematicMapInstance
} from '@mapgis/pan-spatial-map-store'
import RowFlex from '../RowFlex'

@Component({
  components: {
    RowFlex
  }
})
export default class ThematicMapAttributeTable extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  // 显示开关
  atVisible = false

  // 专题
  subject = ''

  // 时间
  time = ''

  // 时间列表
  timeList: string[] = []

  // 列表页码
  page = 0

  // 列表页容量
  pageCount = 10

  // 列表总数
  total = 0

  // 列表加载开关
  tableLoading = false

  // 列表配置
  tableColumns = []

  // 列表数据
  tableData: Record<string, any>[] = []

  // 显示开关
  get visible() {
    return ThematicMapInstance.isVisible('at')
  }

  // 分页配置
  get tablePagination() {
    return {
      current: this.page,
      pageSize: this.pageCount,
      total: this.total,
      showSizeChanger: true,
      pageSizeOptions: ['10', '15', '20', '30', '50'],
      showTotal: total => `共${total}条`
    }
  }

  // 专题列表
  get subjectList() {
    return ThematicMapInstance.getSelectedSujectConfigList
  }

  // 获取时间轴已选中的年度
  get selectedSujectConfigTime() {
    return ThematicMapInstance.getSelectedSubjectConfigTime
  }

  // 获取选中专题对应年度的配置数据
  get selectedSubjectTimeConfig() {
    return ThematicMapInstance.getSelectedSujectConfig(this.subject, this.time)
  }

  /**
   * 专题切换
   * @param value<string>
   */
  onSubjectChange(value) {
    this.page = 0
    this.subject = value
    if (!this.selectedSubjectTimeConfig) return
    this.timeList = this.selectedSubjectTimeConfig.configData.map(
      ({ time }) => time
    )
    this.onTimeChange(this.timeList[0])
    ThematicMapInstance.setSelectedSubjectConfigTimeList(this.timeList)
  }

  /**
   * 时间切换
   * @param value<string>
   */
  onTimeChange(value) {
    this.page = 0
    this.time = value
    if (!this.selectedSubjectTimeConfig) return
    const {
      configType,
      configData,
      configSubData
    } = this.selectedSubjectTimeConfig
    if (configSubData && configSubData.table) {
      this.setTableColumns(configSubData.table)
      this.getTableData(configType, configSubData)
    }
  }

  /**
   * 列表分页变化
   * @param 分页参数 current: 当前页; pageSize: 页容量
   */
  onTableChange({ current, pageSize }) {
    this.page = current
    this.pageCount = pageSize
    const { configType, configSubData } = this.selectedSubjectTimeConfig
    this.getTableData(configType, configSubData)
  }

  /**
   * 设置列表配置
   * @param <object> showFields: 列表字段; showFieldsTitle: 列表字段别名
   */
  setTableColumns({ showFields, showFieldsTitle }) {
    const isFieldsTitle = showFieldsTitle && Object.keys(showFieldsTitle).length
    this.tableColumns = showFields.map((item: string) => {
      const title = isFieldsTitle ? showFieldsTitle[item] : item
      return {
        title,
        dataIndex: title,
        align: 'center'
      }
    })
    console.log(`${this.subject}${this.time}列表配置`, this.tableColumns)
  }

  /**
   * 获取列表数据
   * @param type<string> 请求方式
   * @param subDataItem<string> 数据
   */
  getTableData(type, subDataItem) {
    const {
      ip,
      port,
      gdbp,
      docName,
      layerIndex,
      layerName,
      table
    } = subDataItem
    // 整合参数
    const fields = table.showFields.join(',')
    let params = ThematicMapInstance.getRequestParams({
      ip,
      port,
      fields,
      page: this.page,
      pageCount: this.pageCount,
      IncludeGeometry: true,
      cursorType: 'backward',
      f: 'json'
    })
    switch (type.toLowerCase()) {
      case 'gdbp':
        params = {
          ...params,
          gdbp
        }
        break
      case 'doc':
        params = {
          ...params,
          docName,
          layerIndex,
          layerName
        }
        break
      default:
        break
    }
    const fn = queryFeaturesInstance.query(params) // 同步回调函数返回了同步和异步两种结果,返回的结果为promise或者null,需要做判断
    if (fn.then) {
      try {
        fn.then(dataSet => {
          const geojsonData = queryFeaturesInstance.igsFeaturesToGeoJSONFeatures(
            dataSet
          )
          console.log(`${this.subject}-${this.time}列表数据`, geojsonData)
          this.total = geojsonData.dataCount
          this.tableData = geojsonData.features.map(
            ({ properties }) => properties
          )
        })
      } finally {
        this.tableLoading = false
      }
    }
  }

  /**
   * 监听弹框开关
   */
  @Watch('visible')
  watchVisible(nV) {
    this.atVisible = nV
  }

  /**
   * 监听选择的专题列表变化
   */
  @Watch('subjectList')
  watchSubjectList(nV) {
    if (nV.length) {
      this.onSubjectChange(nV[0].id)
    }
  }

  /**
   * 监听时间轴年度变化
   */
  @Watch('selectedSujectConfigTime')
  watchSelectedYear(nV) {
    this.time = nV
    this.onTimeChange(nV)
  }

  created() {
    this.atVisible = this.visible
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
