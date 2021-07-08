<template>
  <div class="base-items">
    <!-- 专题分类 -->
    <mp-row-flex label="专题分类">
      <a-select
        :value="subjectClassify"
        :options="subjectClassifyList"
        @change="onSubjectClassifyChange"
      />
    </mp-row-flex>
    <!-- 专题名称 -->
    <mp-row-flex label="专题名称">
      <a-select v-model="subjectName" :options="subjectNameList" />
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
      ? this.subjectConfig.map(({ id, title }) => ({
          label: title,
          value: id
        }))
      : []
  }

  /**
   * 专题分类变化
   */
  onSubjectClassifyChange(id: string) {
    this.subjectClassify = id
    this.getSubjectNameList()
  }

  /**
   * 获取专题名称列表
   */
  getSubjectNameList() {
    const nameList = this.subjectClassifyList.find(
      ({ id }) => id === this.subjectClassify
    )
    this.subjectNameList = nameList.children.map(({ id, title }) => ({
      label: title,
      value: id
    }))
  }
}
</script>
<style lang="less" scoped></style>
