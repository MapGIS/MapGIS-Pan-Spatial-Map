<template>
  <!-- 属性表 -->
  <transition name="fade">
    <mp-window-wrapper :visible="visible">
      <mp-window
        :visible.sync="visible"
        :horizontal-offset="48"
        :vertical-offset="50"
        :width="tableWidth"
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
import {
  ModuleType,
  mapGetters,
  mapMutations,
  hasHighlightSubjectList
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
      'linkageFid'
    ])
  },
  methods: {
    ...mapMutations([
      'setFeaturesQuery',
      'setSelectedSubject',
      'setSelectedSubjectTime',
      'setLinkage',
      'resetLinkage',
      'resetVisible'
    ])
  }
})
export default class ThematicMapAttributeTable extends Vue {
  // 专题
  private subject = ''

  // 时间
  private time = ''

  // 列表页码
  private page = 1

  // 列表页容量
  private pageCount = 20

  // 列表总数
  private total = 0

  // 列表宽度
  private tableWidth = 360

  // 列表配置
  private tableColumns = []

  // 列表数据
  private tableData: Record<string, any>[] = []

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
    return hasHighlightSubjectList.includes(this.subjectData?.subjectType)
  }

  // 列表配置
  get table() {
    return this.subjectData?.table
  }

  // 分页配置
  get tablePagination() {
    return {
      size: 'small',
      current: this.page,
      pageSize: this.pageCount,
      total: this.total,
      showSizeChanger: true,
      showLessItems: true,
      pageSizeOptions: ['20', '40', '60', '80', '100'],
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
   * 自定义行数据和事件
   * @param {object} record 行数据
   * @param {number} index 索引
   */
  setCustomRow(record, index) {
    return {
      class: {
        'row-highlight': record._highlight
      },
      on: this.hasHighlight
        ? {
            mouseenter: () => this.setLinkage(record.fid),
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
        ellipsis: true,
        width: 120,
        sorter: (a, b) => {
          const front = a[v]
          const end = b[v]
          if ([front, end].every(v => !isNaN(Number(v)))) {
            return front - end
          } else {
            return front.length - end.length
          }
        }
      }
    })
  }

  /**
   * 设置列表数据
   */
  setTableData() {
    this.setFeaturesQuery({
      params: {
        page: this.page - 1,
        pageCount: this.pageCount
      },
      onSuccess: (geojson: Feature.FeatureIGSGeoJSON) => {
        this.total = geojson?.dataCount || 0
        this.tableData = geojson
          ? geojson.features.map(({ properties }) => properties)
          : []
      }
    })
  }

  /**
   * 专题切换
   * @param {string} value 选项value值
   * @param {object} option 选项
   */
  onSubjectChange(value, option) {
    this.subject = value
    this.setSelectedSubject(option.data.props)
  }

  /**
   * 年度时间切换
   * @param {stirng} value 时间
   */
  onTimeChange(value) {
    this.time = value
    this.setSelectedSubjectTime(value)
  }

  /**
   * 列表分页变化
   * @param {object} param0
   */
  onTableChange({ current, pageSize }) {
    if (this.page !== current || this.pageCount !== pageSize) {
      this.page = current
      if (pageSize) this.pageCount = pageSize
      this.setTableData()
    }
  }

  /**
   * 清除所有高亮
   */
  onClearHighlight() {
    this.tableData.forEach(d => this.$set(d, '_highlight', false))
  }

  /**
   * 高亮
   * @param {string} fid  要素fid
   */
  onHighlight(fid: string) {
    const item = this.tableData.find(d => d.fid === fid)
    if (item) this.$set(item, '_highlight', true)
  }

  /**
   * 设置高亮
   * @param {string} fid  要素fid
   */
  setHighlight(fid: string) {
    this.onClearHighlight()
    this.onHighlight(fid)
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
    this.onTableChange({
      current: 1
    })
  }

  /**
   * 监听: 联动项变化
   */
  @Watch('linkageFid')
  linkageFidChanged(nV) {
    this.setHighlight(nV)
  }

  beforeDestroy() {
    this.resetLinkage()
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
