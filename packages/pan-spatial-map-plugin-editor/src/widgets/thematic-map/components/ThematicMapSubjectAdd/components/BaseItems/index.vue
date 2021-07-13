<template>
  <div class="base-items">
    <!-- 专题分类 -->
    <mp-row-flex label="专题分类" :span="[4, 20]">
      <a-select
        @change="subjectClassifyChange"
        :value="subjectClassify"
        :options="subjectClassifyList"
        placeholder="请选择"
      />
    </mp-row-flex>
    <!-- 专题名称 -->
    <mp-row-flex label="专题名称" :span="[4, 20]">
      <a-select
        v-model="subjectName"
        :options="subjectNameList"
        placeholder="请选择"
      />
    </mp-row-flex>
    <!-- 专题图类型 -->
    <mp-row-flex label="专题图类型" :span="[4, 20]">
      <a-select
        @change="subjectMapTypeChange"
        :value="subjectMapType"
        :options="subjectMapTypeList"
        placeholder="请选择"
      />
    </mp-row-flex>
    <!-- 专题图名称 -->
    <mp-row-flex label="专题图名称" :span="[4, 20]">
      <a-input v-model="subjectMapTitle" placeholder="请输入专题图名称" />
    </mp-row-flex>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { UUID } from '@mapgis/web-app-framework'
import { mapGetters, subjectTypeList } from '../../../../store'

@Component({
  computed: {
    ...mapGetters(['subjectConfig'])
  }
})
export default class BaseItems extends Vue {
  // 专题分类
  subjectClassify = ''

  // 专题分类列表
  subjectClassifyList = []

  // 专题名称
  subjectName = ''

  // 专题名称列表
  subjectNameList = []

  // 专题图类型
  subjectMapType = ''

  // 专题图类型列表
  subjectMapTypeList = subjectTypeList

  // 专题图名称
  subjectMapTitle = ''

  /**
   * 监听专题配置变化
   */
  @Watch('subjectConfig', { immediate: true, deep: true })
  subjectConfigChange(nV) {
    this.subjectClassifyList =
      nV && nV.length
        ? nV
            .filter(({ nodeType }) => nodeType === 'panel')
            .map(({ id, title, children }) => ({
              label: title,
              value: id,
              children
            }))
        : []
    this.subjectClassifyChange(this.subjectClassifyList[0]?.value)
  }

  /**
   * 专题分类变化
   */
  subjectClassifyChange(value) {
    this.subjectClassify = value
    const item = this.subjectClassifyList.find(v => v.value === value)
    this.subjectNameList =
      item.children && item.children.length
        ? item.children
            .filter(({ nodeType }) => nodeType === 'list')
            .map(({ id, title }) => ({
              label: title,
              value: id
            }))
        : []
    this.subjectName = this.subjectNameList[0]?.value
  }

  /**
   * 专题图类型选择变化
   */
  subjectMapTypeChange(value) {
    this.subjectMapType = value
    this.$emit('subject-type-change', value)
  }

  /**
   * 获取专题图基础配置
   * @param 专题图年度配置集合
   */
  getConfig(subjectConfig = []) {
    const {
      subjectClassify: panelId,
      subjectName: listId,
      subjectMapType,
      subjectMapTitle
    } = this
    const subjectNode = {
      id: `${subjectMapType}${UUID.uuid()}`,
      visible: true,
      nodeType: 'subject',
      type: subjectMapType,
      title: subjectMapTitle,
      config: subjectConfig
    }
    return [listId || panelId, subjectNode]
  }
}
</script>
<style lang="less" scoped>
/deep/ .ant-form-item-label {
  color: @text-color-secondary;
}
</style>
