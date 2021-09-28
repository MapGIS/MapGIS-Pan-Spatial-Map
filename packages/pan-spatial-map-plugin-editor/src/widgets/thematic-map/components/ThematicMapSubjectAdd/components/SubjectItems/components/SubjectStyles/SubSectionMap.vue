<template>
  <!-- 分段专题图配置 -->
  <mapgis-ui-custom-panel ref="customPanelForm" :options="options" />
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import SubjectStylesMixin from '../../../../mixins/subject-styles-mixin'

@Component
export default class SubSectionMap extends Mixins(SubjectStylesMixin) {
  get options() {
    return [
      {
        id: this.id,
        title: '',
        type: 'MapgisUiThemeList',
        props: {
          size: 'small',
          field: this.field,
          dataSource: this.dataSource
        },
        customProps: {
          showBorder: false
        }
      }
    ]
  }

  /**
   * 保存: 保存时调用
   */
  getFormResult() {
    const values = this.$refs.customPanelForm.$_getForm()
    return {
      color: Object.values(values)
    }
  }
}
</script>
