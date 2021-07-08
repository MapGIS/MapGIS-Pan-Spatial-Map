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
        <a-spin :spinning="loading">
          <mp-row-flex
            :span="[13, 10]"
            justify="space-between"
            class="attribute-table-head"
          >
            <template #label>
              <mp-row-flex label="专题" :span="[4, 20]">
                <a-select :value="subject" @change="onSubjectChange">
                  <a-select-option v-for="s in subjectList" :key="s.id">{{
                    s.title
                  }}</a-select-option>
                </a-select>
              </mp-row-flex>
            </template>
            <mp-row-flex label="时间" :span="[5, 19]">
              <a-select :value="time" @change="onTimeChange">
                <a-select-option v-for="y in selectedTimeList" :key="y">{{
                  y
                }}</a-select-option>
              </a-select>
            </mp-row-flex>
          </mp-row-flex>
          <!-- 分页列表 -->
          <a-table
            bordered
            row-key="fid"
            @change="onTableChange"
            :columns="tableColumns"
            :data-source="tableData"
            :pagination="tablePagination"
            :scroll="tableScroll"
            :customRow="getCustomRow"
          />
        </a-spin>
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Watch, Mixins } from 'vue-property-decorator'
import { Feature } from '@mapgis/web-app-framework'
import { mapGetters, mapMutations } from '../../store'

@Component({
  computed: {
    ...mapGetters([
      'loading',
      'isVisible',
      'selected',
      'selectedTime',
      'selectedList',
      'selectedSubConfig',
      'selectedTimeList',
      'highlightItem'
    ])
  },
  methods: {
    ...mapMutations([
      'resetVisible',
      'setPage',
      'setSelected',
      'setSelectedTime',
      'setFeaturesQuery',
      'setHighlightItem'
    ])
  }
})
export default class ThematicMapAttributeTable extends Vue {
  vuekey = 'table'

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
      y: 275
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
      pageSizeOptions: ['10', '15', '20', '25', '30', '35', '40', '45', '50'],
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
   * 自定义行数据和事件
   */
  getCustomRow(record, index) {
    return {
      props: {},
      class: {
        highlight: record._highlight
      },
      on: {
        mouseenter: event => {
          this.setHighlightItem({
            from: this.vuekey,
            itemIndex: index
          })
        },
        mouseleave: event => {}
      }
    }
  }

  /**
   * 设置列表配置
   */
  getTableColumns() {
    if (!this.selectedSubConfig) return
    const { showFields, showFieldsTitle } = this.selectedSubConfig.table
    this.tableColumns = showFields.map((v: string, i: number) => {
      const title =
        showFieldsTitle && showFieldsTitle[v] ? showFieldsTitle[v] : v
      return {
        title,
        dataIndex: v,
        align: 'center',
        sorter: true
      }
    })
  }

  /**
   * 设置列表数据
   */
  getTableData() {
    this.setFeaturesQuery({
      onSuccess: (dataSet: Feature.FeatureIGS | null) => {
        if (dataSet) {
          const geojsonData = Feature.FeatureConvert.featureIGSToFeatureGeoJSON(
            dataSet
          )
          if (geojsonData) {
            this.total = geojsonData.dataCount
            this.tableData = geojsonData.features.map(
              ({ properties }) => properties
            )
          }
        } else {
          this.total = 0
          this.tableData = []
        }
      }
    })
  }

  /**
   * 专题切换
   * 1.重置列表页码
   * 2.获取并保存选择的专题的年度列表
   * 3.设置默认展示的年度
   * @param value<string>
   */
  onSubjectChange(value) {
    this.subject = value
    this.setSelected(value)
    this.onTimeChange(this.selectedTimeList[0])
  }

  /**
   * 年度时间切换
   * 1.重置列表页码
   * 2.保存当前选择的年度(同步更新时间轴)
   * 3.获取对应年度的列表配置和数据
   * @param value<string>
   */
  onTimeChange(value) {
    this.time = value
    this.setSelectedTime(value)
    this.getTableColumns()
    this.onTableChange({
      current: 1,
      pageSize: this.pageCount
    })
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
    this.setPage({
      page: current,
      pageCount: pageSize
    })
    this.getTableData()
  }

  /**
   * 监听: 专题变化
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

  /**
   * 监听: 高亮
   */
  @Watch('highlightItem', { deep: true })
  watchHighlightItem(nV) {
    if (nV && nV.from !== this.vuekey && nV.marker) {
      this.tableData.forEach(d => this.$set(d, '_highlight', false))
      this.$set(this.tableData[nV.itemIndex], '_highlight', true)
    }
  }

  created() {
    this.onSubjectChange(this.selected)
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
