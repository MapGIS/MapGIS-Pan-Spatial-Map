<template>
  <div class="base-items">
    <!-- 专题服务名称 -->
    <row-flex label="专题服务名称">
      <a-input v-model="subjectName" placeholder="请输入" />
    </row-flex>
    <!-- 专题服务分类 -->
    <row-flex label="专题服务分类">
      <a-tree
        :tree-data="sujectServerTypeTreeData"
        :replace-fields="{ key: 'id' }"
        @select="onSujectServerTypeSelect"
      />
    </row-flex>
    <!-- 专题类型 -->
    <row-flex label="专题类型" label-align="right">
      <a-select v-model="sujectType" :options="sujectTypeList" />
    </row-flex>
    <subject-type :type="sujectType" />
    <!-- 数据来源 -->
    <row-flex label="数据来源" label-align="right">
      <a-select v-model="sourceTarget" :options="sourceTargetList" />
    </row-flex>
    <source-target :type="sourceTarget" />
  </div>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import RowFlex from '../../RowFlex'
import SourceTarget from './SourceTarget'
import SubjectType from './SubjectType'

interface IItem {
  label: string
  value: string
}

@Component({
  components: {
    RowFlex,
    SourceTarget,
    SubjectType
  }
})
export default class BaseItems extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  // 专题服务名称
  subjectName = ''

  // 专题服务分类
  sujectServerType = ''

  // 专题服务分类树
  sujectServerTypeTreeData: any[] = []

  // 专题类型
  sujectType = ''

  // 专题类型列表
  sujectTypeList: IItem[] = [
    { value: 'SubSectionMap', label: '分段专题图' },
    { value: 'BaseMapWithGraph', label: '统计专题图' },
    { value: 'StatisticLabel', label: '等级符号专题图' },
    { value: 'Label', label: '聚合标注专题图' },
    { value: 'HeatMap', label: '热力图' },
    { value: 'HexBin', label: '蜂窝图' }
  ]

  // 数据来源
  sourceTarget = ''

  // 数据来源列表
  sourceTargetList = [
    {
      label: '线上数据',
      value: 'onLineData'
    },
    {
      label: '本地数据',
      value: 'localData'
    }
  ]

  onSujectServerTypeSelect() {}
}
</script>
<style lang="less" scoped></style>
