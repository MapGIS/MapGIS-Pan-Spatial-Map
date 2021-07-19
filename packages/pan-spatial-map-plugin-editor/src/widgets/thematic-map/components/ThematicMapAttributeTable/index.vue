<template>
  <!-- 属性表 -->
  <mp-window-wrapper :visible="atVisible">
    <mp-window
      :visible.sync="atVisible"
      :horizontalOffset="12"
      :verticalOffset="50"
      anchor="top-right"
      title="属性表"
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
                <a-select
                  :value="subject"
                  :options="subjectList"
                  @change="onSubjectChange"
                />
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
          <a-empty v-if="!tableColumns.length" />
          <a-table
            v-else
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
import _debounce from 'lodash/debounce'
import { mapGetters, mapMutations, highlightSubjectTypes } from '../../store'
import base from '@mapgis/pan-spatial-map-store/src/config/base'

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
      'linkageItem'
    ])
  },
  methods: {
    ...mapMutations([
      'setPage',
      'setSelected',
      'setSelectedTime',
      'setFeaturesQuery',
      'setLinkageItem',
      'resetLinkage',
      'resetVisible'
    ])
  }
})
export default class ThematicMapAttributeTable extends Vue {
  vueKey = 'table'

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
    return this.table && this.isVisible('at')
  }

  set atVisible(nV) {
    if (!nV) {
      this.resetVisible('at')
    }
  }

  // 是否支持图属高亮
  get hasHighlight() {
    return highlightSubjectTypes.includes(this.selectedSubConfig?.subjectType)
  }

  // 列表配置
  get table() {
    return this.selectedSubConfig?.table
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
    return this.selectedList.map(({ id, title, ...others }) => ({
      value: id,
      label: title,
      ...others
    }))
  }

  /**
   * 清除所有高亮
   */
  clearHighlight() {
    this.tableData.forEach(d => this.$set(d, '_highlight', false))
  }

  /**
   * 设置高亮
   */
  setHighlight(itemIndex: number) {
    const node = this.tableData[itemIndex]
    if (node) {
      this.$set(node, '_highlight', true)
    }
  }

  /**
   * 自定义行数据和事件
   */
  getCustomRow(record, index) {
    return {
      class: {
        highlight: record._highlight
      },
      on: this.hasHighlight
        ? {
            mouseenter: _debounce(() => {
              this.setLinkageItem({
                from: this.vueKey,
                itemIndex: index
              })
            }, 400),
            mouseleave: this.resetLinkage
          }
        : {}
    }
  }

  /**
   * 设置列表配置
   */
  getTableColumns() {
    if (!this.table) return
    const { showFields, showFieldsTitle } = this.table
    this.tableColumns = showFields.map((v: string, i: number) => {
      const title =
        showFieldsTitle && showFieldsTitle[v] ? showFieldsTitle[v] : v
      return {
        title,
        dataIndex: v,
        align: 'center',
        sorter: (a, b) => {
          if ([a[v], b[v]].every(v => !isNaN(Number(v)))) {
            return a[v] - b[v]
          } else {
            return a[v].length - b[v].length
          }
        }
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
   */
  onSubjectChange(value, option) {
    this.subject = value
    this.setSelected(option.data.props)
  }

  /**
   * 年度时间切换
   * 1.重置列表页码
   * 2.保存当前选择的年度(同步更新时间轴)
   * 3.获取对应年度的列表配置和数据
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
  onTableChange({ current, pageSize }, filters, sorter) {
    if (this.page !== current || this.pageCount !== pageSize) {
      this.page = current
      this.pageCount = pageSize
      this.setPage({
        page: current,
        pageCount: pageSize
      })
      this.getTableData()
    }
  }

  /**
   * 监听: 当前选中的专题变化
   */
  @Watch('selected.id')
  watchSelectedId(nV: string) {
    if (this.subject !== nV) {
      this.subject = nV
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
   * 监听: 联动项变化
   */
  @Watch('linkageItem', { deep: true })
  watchHighlightItem(nV) {
    if (!nV) {
      this.clearHighlight()
    } else if (nV.from !== this.vueKey) {
      this.setHighlight(nV.itemIndex)
    }
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
