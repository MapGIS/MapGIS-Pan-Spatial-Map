<template>
  <!-- 属性表 -->
  <transition name="fade">
    <mp-window-wrapper :visible="visible">
      <mp-window
        :visible.sync="visible"
        :horizontal-offset="48"
        :vertical-offset="50"
        :max-width="tableWidth"
        :has-padding="false"
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
                <mp-row-flex label="专题" :label-width="44">
                  <a-select
                    @change="onSubjectChange"
                    :value="subject"
                    :options="subjectList"
                    size="small"
                  />
                </mp-row-flex>
              </template>
              <mp-row-flex label="时间" :label-width="44">
                <a-select @change="onTimeChange" :value="time" size="small">
                  <a-select-option
                    v-for="y in selectedSubjectTimeList"
                    :key="y"
                    >{{ y }}</a-select-option
                  >
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
              :customRow="setCustomRow"
            />
          </a-spin>
        </div>
      </mp-window>
    </mp-window-wrapper>
  </transition>
</template>
<script lang="ts">
import { Vue, Component, Watch, Mixins } from 'vue-property-decorator'
import { Feature } from '@mapgis/web-app-framework'
import _debounce from 'lodash/debounce'
import {
  ModuleType,
  mapGetters,
  mapMutations,
  highlightSubjectTypes
} from '../../store'

@Component({
  computed: {
    ...mapGetters([
      'loading',
      'isVisible',
      'subjectData',
      'selectedSubject',
      'selectedSubjectList',
      'selectedSubjectTime',
      'selectedSubjectTimeList',
      'linkageItem'
    ])
  },
  methods: {
    ...mapMutations([
      'setPage',
      'setFeaturesQuery',
      'setSelectedSubject',
      'setSelectedSubjectTime',
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
  page = 1

  // 列表页容量
  pageCount = 10

  // 列表总数
  total = 0

  // 列表配置
  tableColumns = []

  // 列表数据
  tableData: Record<string, any>[] = []

  // 显示开关
  get visible() {
    return this.table && this.isVisible(ModuleType.TABLE)
  }

  set visible(nV) {
    if (!nV) {
      this.resetVisible(ModuleType.TABLE)
    }
  }

  // 是否支持图属高亮
  get hasHighlight() {
    return highlightSubjectTypes.includes(this.subjectData?.subjectType)
  }

  // 列表配置
  get table() {
    return this.subjectData?.table
  }

  // 列表宽度
  get tableWidth() {
    return 360
  }

  // 列表滚动
  get tableScroll() {
    const { length } = this.tableColumns
    const x = length > 3 ? length * 120 : this.tableWidth
    return {
      x,
      y: 230
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

  // 专题节点列表
  get subjectList() {
    return this.selectedSubjectList.map(({ id, title, ...others }) => ({
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
  setCustomRow(record, index) {
    return {
      class: {
        'row-highlight': record._highlight
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
  setTableColumns() {
    if (!this.table) return
    const { showFields, showFieldsTitle } = this.table
    this.tableColumns = showFields.map((v: string, i: number) => {
      const title =
        showFieldsTitle && showFieldsTitle[v] ? showFieldsTitle[v] : v
      return {
        title,
        dataIndex: v,
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
  setTableData(page = this.page, pageCount = this.pageCount) {
    this.page = page
    this.pageCount = pageCount
    this.setPage({
      page: page - 1,
      pageCount
    })
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
   */
  onSubjectChange(value, option) {
    this.subject = value
    this.setSelectedSubject(option.data.props)
  }

  /**
   * 年度时间切换
   */
  onTimeChange(value) {
    this.time = value
    this.setSelectedSubjectTime(value)
  }

  /**
   * 列表分页变化
   * @param 分页参数 current: 当前页; pageSize: 页容量
   */
  onTableChange({ current, pageSize }, filters, sorter) {
    if (this.page !== current || this.pageCount !== pageSize) {
      this.setTableData(current, pageSize)
    }
  }

  /**
   * 监听: 选中的专题变化
   */
  @Watch('selectedSubject.id')
  selectedSubjectChanged(nV: string) {
    if (this.subject !== nV) {
      this.subject = nV
    }
  }

  /**
   * 监听: 时间和时间轴变化
   */
  @Watch('selectedSubjectTime')
  selectedSubjectTimeChanged(nV: string) {
    if (this.time !== nV) {
      this.time = nV
    }
  }

  /**
   * 监听: 专题数据变化
   */
  @Watch('subjectData', { deep: true })
  subjectDataChanged() {
    this.setTableColumns()
    this.setTableData(1)
  }

  /**
   * 监听: 联动项变化
   */
  @Watch('linkageItem', { deep: true })
  linkageItemChanged(nV) {
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
