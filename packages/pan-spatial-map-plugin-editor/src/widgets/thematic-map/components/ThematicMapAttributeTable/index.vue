<template>
  <!-- 属性表 -->
  <mp-window-wrapper :visible="atVisible">
    <mp-window
      title="属性表"
      :visible.sync="atVisible"
      anchor="top-right"
      :horizontalOffset="12"
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
    return ThematicMapInstance.getSelectedList
  }

  // 获取时间轴已选中的年度(回显至时间选项)
  get selectedTime() {
    return ThematicMapInstance.getSelectedTime
  }

  // 获取选中专题对应年度的配置数据以及配置数据, 结果参考getSelectedSujectConfig的注释说明或者ts接口
  get selectedConfig() {
    return ThematicMapInstance.getSelectedConfig
  }

  /**
   * 专题切换
   * 1.重置列表页码
   * 2.获取并保存选择的专题的年度列表
   * 3.设置默认展示的年度
   * @param value<string>
   */
  onSubjectChange(value) {
    this.page = 0
    this.subject = value
    ThematicMapInstance.setSelected(value)
    if (!this.selectedConfig) return
    this.timeList = this.selectedConfig.configTimeList
    this.onTimeChange(this.timeList[0])
    ThematicMapInstance.setSelectedTimeList(this.timeList)
  }

  /**
   * 年度时间切换
   * 1.重置列表页码
   * 2.保存当前选择的年度(同步更新时间轴)
   * 3.获取对应年度的列表配置和数据
   * @param value<string>
   */
  onTimeChange(value) {
    this.page = 0
    this.time = value
    ThematicMapInstance.setSelectedTime(value)
    if (!this.selectedConfig) return
    const subData = this.selectedConfig.configSubData
    if (subData && subData.table) {
      this.setTableColumns(subData.table)
      this.getTableData()
    }
  }

  /**
   * 列表分页变化
   * 1.设置分页页码和页容量
   * 2.获取分页数据
   * @param 分页参数 current: 当前页; pageSize: 页容量
   */
  onTableChange({ current, pageSize }) {
    this.page = current
    this.pageCount = pageSize
    this.getTableData()
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
  }

  /**
   * 获取列表数据
   */
  getTableData() {
    this.tableLoading = true
    const params = ThematicMapInstance.getRequestParams(
      this.page,
      this.pageCount
    )
    const fn = queryFeaturesInstance.query(params)
    if (fn && fn.then) {
      fn.then(dataSet => {
        const geojsonData = queryFeaturesInstance.igsFeaturesToGeoJSONFeatures(
          dataSet
        )
        this.total = geojsonData.dataCount
        this.tableData = geojsonData.features.map(
          ({ properties }) => properties
        )
        this.tableLoading = false
      }).catch(e => {
        this.tableLoading = false
      })
    }
  }

  /**
   * 监听:弹框开关
   */
  @Watch('visible')
  watchVisible(nV) {
    this.atVisible = nV
  }

  /**
   * 监听:侧边栏的单个专题的选择发生变化,需要同步更新专题选项
   */
  @Watch('subjectList')
  watchSubjectList(nV) {
    if (nV.length) {
      this.onSubjectChange(nV[nV.length - 1].id)
    }
  }

  /**
   * 监听: 年度时间轴数据切换,需要同步更新时间选项
   */
  @Watch('selectedTime')
  watchSelectedYear(nV) {
    if (this.time !== nV) {
      this.onTimeChange(nV)
    }
  }

  created() {
    this.atVisible = this.visible
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
