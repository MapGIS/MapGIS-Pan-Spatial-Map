<template>
  <div class="mp-widget-vector-tile-carto">
    <tree-layer
      v-show="!showStyleSetting"
      :widgetInfo="widgetInfo"
      @changeNode="changeNode"
    />
    <div v-show="showStyleSetting">
      <mapgis-ui-button type="link" @click="goBack" size="small">
        <mapgis-ui-iconfont type="mapgis-left" />返回主页
      </mapgis-ui-button>
      <mapgis-ui-group-tab :title="settingLayerId" style="margin-bottom:5px" />
      <mapgis-mvt-editor
        v-if="settingLayerId !== undefined"
        :layerid="settingLayerId"
        :visible="true"
        @edit-change="handleEditChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import treeLayer from '../../../../pan-spatial-map-plugin-workspace/src/widgets/layer-list/tree-layer.vue'

@Component({
  name: 'MpVectorTileCarto',
  components: { treeLayer }
})
export default class MpVectorTileCarto extends Mixins(WidgetMixin) {
  private showStyleSetting = false

  private settingLayerId = undefined

  changeNode(node) {
    this.settingLayerId = node['source-layer']
    this.showStyleSetting = true
    console.log(node)
  }

  handleEditChange() {
    console.log('change')
  }

  goBack() {
    this.showStyleSetting = false
  }
}
</script>
<style lang="less" scoped>
.mp-widget-vector-tile-carto {
  ::v-deep .mapgis-ui-radio-group {
    font-size: 12px;
  }

  ::v-deep .mapgis-ui-btn {
    font-size: 12px;
  }

  ::v-deep .mapgis-ui-form label {
    font-size: 12px;
  }
  
  ::v-deep .mapgis-mvt-action-filter {
    font-size: 12px;
  }

  ::v-deep .mapgis-ui-radio-wrapper {
    font-size: 12px;
  }

  ::v-deep .mapgis-ui-input-number {
    font-size: 12px;
  }
}
</style>
