<template>
  <div class="base-items">
    <a-row type="flex" align="middle">
      <a-col span="6">专题服务名称：</a-col>
      <a-col span="18">
        <a-input v-model="subjectName" />
      </a-col>
    </a-row>
    <a-row type="flex" align="middle">
      <a-col span="6">专题服务分类：</a-col>
      <a-col span="18">
        <a-tree
          :tree-data="sujectServerTypeTreeData"
          :replace-fields="replaceFields"
          @select="onSujectServerTypeSelect"
        />
      </a-col>
    </a-row>
    <a-row type="flex" align="middle">
      <a-col span="6">专题类型：</a-col>
      <a-col span="18">
        <a-select v-model="sujectType">
          <a-select-option v-for="item in sujectTypeList" :key="item.value">{{
            item.label
          }}</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row type="flex" align="middle">
      <a-col span="6">数据来源：</a-col>
      <a-col span="18">
        <a-select v-model="sourceTarget">
          <a-select-option value="onLineData">线上数据</a-select-option>
          <a-select-option value="localData">本地数据</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <!-- 数据来源 -->
    <source-target />
    <!-- 服务类型子组件 -->
    <subject-type :sujectType="sujectType" />
  </div>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import SourceTarget from './components/SourceTarget'
import SubjectType from './components/SubjectType'

interface IItem {
  label: string
  value: string
}

@Component({
  components: {
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

  get replaceFields() {
    return {
      key: 'id'
    }
  }

  onSujectServerTypeSelect() {}
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
