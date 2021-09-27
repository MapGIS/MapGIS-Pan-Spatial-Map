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

  get field() {
    return this.value.field
  }

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

  /**
   * 获取指定属性的GeoJSON数据
   * @param {object} params 查询参数
   */
  async setDataSource({
    ip,
    port,
    docName,
    layerName,
    layerIndex,
    gdbp,
    field
  }) {
    if (!field) return
    const dataSet: Feature.FeatureIGS = await Feature.FeatureQuery.query({
      ip,
      port,
      fields: [field],
      IncludeGeometry: true,
      f: 'json',
      ...(docName
        ? {
            docName,
            layerName,
            layerIdxs: layerIndex
          }
        : {
            gdbp
          })
    })
    if (!dataSet) return
    this.dataSource = Feature.FeatureConvert.featureIGSToFeatureGeoJSON(dataSet)
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

  @Watch('field')
  fieldChanged(nV) {
    this.setDataSource({
      field: nV,
      ...this.value
    })
  }

  mounted() {
    dep.addSub(this)
  }

  beforeDestroy() {
    dep.removeSub(this)
  }
}
</script>
<style lang="less" scoped></style>
