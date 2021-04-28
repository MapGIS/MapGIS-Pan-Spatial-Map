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
              <a-select v-model="subject" :options="subjectList" />
            </row-flex>
          </template>
          <row-flex label="时间" :span="[5, 19]">
            <a-select v-model="time" :options="timeList" />
          </row-flex>
        </row-flex>
        <!-- 分页列表 -->
        <a-table
          row-key="id"
          :loading="tableLoading"
          :columns="tableColumns"
          :data-source="tableData"
          :pagination="tablePagination"
          :scroll="{ x: 500, y: 360 }"
        />
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { ThematicMapInstance } from '@mapgis/pan-spatial-map-store'
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

  // 专题列表
  subjectList: any[] = []

  // 时间
  time = ''

  // 时间列表
  timeList: (string | number)[] = []

  // 列表加载开关
  tableLoading = false

  //  列表配置 title: '年份', dataIndex: 'date'
  tableColumns = []

  // 列表数据
  tableData: Record<string, any>[] = []

  get visible() {
    return ThematicMapInstance.isVisible('at')
  }

  // 分页配置
  get tablePagination() {
    return {
      showSizeChanger: true,
      pageSizeOptions: ['10', '15', '20', '30', '50'],
      showTotal: total => `共${total}条`
    }
  }

  // 获取时间轴已选中的年度
  get selectedYear() {
    return ThematicMapInstance.getSelectedYear
  }

  /**
   * 监听时间轴年度变化
   */
  @Watch('selectedYear')
  watchSelectedYear(nV) {
    this.time = nV
    console.log('属性表获取到的当前年度', nV)
  }

  @Watch('visible')
  watchVisible(nV) {
    this.atVisible = nV
  }

  created() {
    this.atVisible = this.visible
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
