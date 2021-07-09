<template>
  <div class="base-items">
    <!-- 专题分类 -->
    <mp-row-flex label="专题分类" label-align="right">
      <a-select v-model="subjectClassify" :options="subjectClassifyList" />
    </mp-row-flex>
    <!-- 专题名称 -->
    <mp-row-flex label="专题名称" label-align="right">
      <a-select
        v-model="subjectName"
        :options="subjectNameList"
        @dropdownVisibleChange="onDropdownVisibleChange"
      />
    </mp-row-flex>
    <!-- 年度或时间 -->
    <mp-row-flex label="年度/时间" label-align="right">
      <a-input placeholder="请输入年度/时间" />
    </mp-row-flex>
    <!-- 专题类型 -->
    <subject-types />
    <!-- 数据来源 -->
    <source-target />
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { mapGetters } from '../../../store'
import SourceTarget from './SourceTarget'
import SubjectTypes from './SubjectTypes'

@Component({
  components: {
    SourceTarget,
    SubjectTypes
  },
  computed: {
    ...mapGetters(['subjectConfig'])
  }
})
export default class BaseItems extends Vue {
  // 专题分类
  subjectClassify = ''

  // 专题名称
  subjectName = ''

  // 专题名称列表
  subjectNameList = []

  // 专题分类列表
  get subjectClassifyList() {
    return this.subjectConfig
      ? this.subjectConfig.map(({ id, title, children }) => ({
          label: title,
          value: id,
          children
        }))
      : []
  }

  /**
   * 获取专题名称列表
   */
  getSubjectNameList() {
    const item = this.subjectClassifyList.find(
      ({ value }) => value === this.subjectClassify
    )
    const { children } = item
    this.subjectNameList =
      children && children.length
        ? children.map(({ id, title }) => ({
            label: title,
            value: id
          }))
        : []
  }

  /**
   * 专题分类变化
   */
  onDropdownVisibleChange(open) {
    if (open) {
      this.getSubjectNameList()
    }
  }
}
</script>
<style lang="less" scoped></style>
