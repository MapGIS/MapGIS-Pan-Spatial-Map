<template>
  <!-- 分段专题图配置 -->
  <mapgis-ui-custom-panel ref="customPanelForm" :options="options" />
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { UUID, Feature } from '@mapgis/web-app-framework'
import dep from '../../../../store/dep'

@Component
export default class SubSectionMap extends Vue {
  @Prop({ type: Object }) readonly value!: Record<string, any>

  private dataSource: Feature.FeatureGeoJSON | null = null

  get options() {
    return [
      {
        id: UUID.uuid(),
        title: '列表',
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

  get field() {
    return this.value.field
  }

  @Watch('field')
  fieldChanged(nV) {
    dep
      .getFieldGeoJson({
        field: nV,
        ...this.value
      })
      .then(dataSource => (this.dataSource = dataSource))
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

  mounted() {
    dep.addSub(this)
  }

  beforeDestroy() {
    dep.removeSub(this)
  }
}
</script>
