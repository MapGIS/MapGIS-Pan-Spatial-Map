<template>
  <!-- 等级符号专题图 -->
  <mapgis-ui-custom-panel ref="customPanelForm" :options="options" />
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import SubjectStylesMixin from '../../../../mixins/subject-styles-mixin'

@Component
export default class StatisticLabel extends Mixins(SubjectStylesMixin) {
  get options() {
    return [
      {
        id: this.id,
        title: '',
        type: 'MapgisUiThemeListSymbol',
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
    const labelStyle = this.$refs.customPanelForm.$_getForm()
    return {
      labelStyle
    }
  }
}
</script>
