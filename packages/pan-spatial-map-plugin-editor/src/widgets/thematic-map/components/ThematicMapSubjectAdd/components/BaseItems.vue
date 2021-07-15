<template>
  <div class="base-items">
    <!-- 专题服务名称 -->
    <mp-row-flex label="专题服务名称">
      <a-input v-model="subjectName" placeholder="请输入" />
    </mp-row-flex>
    <!-- 专题服务分类 -->
    <mp-row-flex label="专题服务分类">
      <a-tree
        :tree-data="sujectServerTypeTreeData"
        :replace-fields="{ key: 'id' }"
        @select="onSujectServerTypeSelect"
      />
    </mp-row-flex>
    <!-- 专题类型 -->
    <mp-row-flex label="专题类型" label-align="right">
      <a-select v-model="sujectType" :options="sujectTypeList" />
    </mp-row-flex>
    <subject-types :type="sujectType" />
    <!-- 数据来源 -->
    <mp-row-flex label="数据来源" label-align="right">
      <a-select v-model="sourceTarget" :options="sourceTargetList" />
    </mp-row-flex>
    <source-target :type="sourceTarget" />
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { subjectTypes } from '../../../store'
import SourceTarget from './SourceTarget'
import SubjectTypes from './SubjectTypes'

@Component({
  components: {
    SourceTarget,
    SubjectTypes
  }
})
export default class BaseItems extends Vue {
  // 专题服务名称
  subjectName = ''

  // 专题服务分类
  sujectServerType = ''

  // 专题服务分类树
  sujectServerTypeTreeData: any[] = []

  // 专题类型
  sujectType = ''

  // 专题类型列表
  sujectTypeList = subjectTypes

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
