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
        <div>{{ atVisible }}</div>
        <a-spin :spinning="loading">
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
                <a-select-option v-for="y in configTimeList" :key="y">{{
                  y
                }}</a-select-option>
              </a-select>
            </row-flex>
          </row-flex>
          <!-- 分页列表 -->
          <a-table
            bordered
            row-key="fid"
            :columns="tableColumns"
            :data-source="tableData"
            :pagination="tablePagination"
            :scroll="tableScroll"
            @change="onTableChange"
          />
        </a-spin>
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Watch, Mixins } from 'vue-property-decorator'
import {
  queryFeaturesInstance,
  mapGetters,
  mapMutations
} from '@mapgis/pan-spatial-map-store'
import ThematicMapMixin from '../../mixins/thematic-map'
import RowFlex from '../RowFlex'

@Component({
  computed: {
    ...mapGetters([
      'loading',
      'isVisible',
      'selected',
      'selectedList',
      'selectedTime',
      'pageDataSet',
      'configSubData',
      'configTimeList'
    ])
  },
  methods: {
    ...mapMutations([
      'resetVisible',
      'setFeaturesQuery',
      'setPage',
      'setSelected',
      'setSelectedTime'
    ])
  },
  components: {
    RowFlex
  }
})
export default class ThematicMapAttributeTable extends Vue {
  // 专题
  subject = ''

  // 时间
  time = ''

  // 列表页码
  page = 0

  // 列表页容量
  pageCount = 10

  // 列表总数
  total = 0

  // 列表配置
  tableColumns = []

  // 列表数据
  tableData: Record<string, any>[] = []

  // 显示开关
  get atVisible() {
    return this.isVisible('at')
  }

  set atVisible(nV) {
    if (!nV) {
      this.resetVisible('at')
    }
  }

  // 列表滚动
  get tableScroll() {
    const { length } = this.tableColumns
    const x = length > 3 ? length * 120 : 500
    return {
      x,
      y: 360
    }
  }

  // 分页配置
  get tablePagination() {
    return {
      size: 'small',
      current: this.page,
      pageSize: this.pageCount,
      total: this.total,
      showSizeChanger: true,
      showTotal: total => `共${total}条`
    }
  }

  // 专题列表
  get subjectList() {
    return this.selectedList.map(({ id, title }) => ({
      id,
      title
    }))
  }

  /**
   * 设置列表配置
   */
  getTableColumns() {
    const { showFields, showFieldsTitle } = this.configSubData.table
    this.tableColumns = showFields.map((item: string, i: number) => {
      const title =
        showFieldsTitle && showFieldsTitle[item] ? showFieldsTitle[item] : item
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
    this.setFeaturesQuery({
      onSuccess: dataSet => {
        const geojsonData = queryFeaturesInstance.igsFeaturesToGeoJSONFeatures(
          dataSet
        )
        this.total = geojsonData.dataCount
        this.tableData = geojsonData.features.map(
          ({ properties }) => properties
        )
      }
    })
  }

  /**
   * 更新、重置分页页码
   */
  updatePage(pageCount = 10, page = 1) {
    this.page = page
    this.pageCount = pageCount
    this.setPage({ page, pageCount })
  }

  /**
   * 专题切换
   * 1.重置列表页码
   * 2.获取并保存选择的专题的年度列表
   * 3.设置默认展示的年度
   * @param value<string>
   */
  onSubjectChange(value) {
    this.updatePage(this.pageCount)
    this.subject = value
    this.setSelected(value)
    this.onTimeChange(this.configTimeList[0])
  }

  /**
   * 年度时间切换
   * 1.重置列表页码
   * 2.保存当前选择的年度(同步更新时间轴)
   * 3.获取对应年度的列表配置和数据
   * @param value<string>
   */
  onTimeChange(value) {
    this.updatePage(this.pageCount)
    this.time = value
    this.setSelectedTime(value)
    this.getTableColumns()
    if (this.time) {
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
    this.updatePage(pageSize, current)
    this.getTableData()
  }

  /**
   * 监听:侧边栏的单个专题的选择发生变化,需要同步更新专题选项
   */
  @Watch('selected')
  watchSelected(nV: string) {
    if (this.subject !== nV) {
      this.onSubjectChange(nV)
    }
  }

  /**
   * 监听: 年度时间轴数据切换,需要同步更新时间选项
   */
  @Watch('selectedTime')
  watchSelectedTime(nV: string) {
    if (this.time !== nV) {
      this.onTimeChange(nV)
    }
  }

  created() {
    this.onSubjectChange(this.subjectList[0].id)
  }

  beforeDestroyed() {
    this.atVisible = false
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
