<template>
  <div class="mp-widget-vector-tile-carto">
    <mp-tree-layer
      v-if="showWidget && !showStyleSetting"
      :widgetInfo="widgetInfo"
      :layerDocument.sync="vectorTileDocument"
      @click-item="changeNode"
      @changed="getChanged"
    >
    </mp-tree-layer>
    <div v-show="showStyleSetting">
      <mapgis-ui-button type="link" @click="goBack" size="small">
        <mapgis-ui-iconfont type="mapgis-left" />返回主页
      </mapgis-ui-button>
      <div v-if="settingLayerId !== ''">
        <mapgis-ui-group-tab
          :title="settingLayerId"
          style="margin-bottom:5px"
        />
        <mapgis-mvt-editor
          :layerid="settingLayerId"
          :visible="true"
          @edit-change="handleEditChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { LayerType, WidgetMixin, Document } from '@mapgis/web-app-framework'

@Component({
  name: 'MpVectorTileCarto'
})
export default class MpVectorTileCarto extends Mixins(WidgetMixin) {
  private showStyleSetting = false

  private settingLayerId = ''

  private vectorTileDocument = new Document()

  get showWidget() {
    return (
      this.vectorTileDocument &&
      this.vectorTileDocument.defaultMap &&
      this.vectorTileDocument.defaultMap.layers() &&
      this.vectorTileDocument.defaultMap.layers().length > 0
    )
  }

  @Watch('document.defaultMap', { immediate: true, deep: true })
  documentChange() {
    if (!this.document) return
    this.vectorTileDocument.defaultMap.removeAll()
    this.document.defaultMap
      .clone()
      .getFlatLayers()
      .forEach(layer => {
        if (layer.type === LayerType.VectorTile) {
          this.vectorTileDocument.defaultMap.add(layer)
        }
      })
  }

  /**
   * 图层树选择同步到全局的document
   */
  getChanged(layerIds) {
    // console.log(layerIds)
    const doc = this.document.clone()
    const layers: Array<unknown> = doc.defaultMap.layers()
    layerIds.forEach(item => {
      if (item.split('-').length > 1) {
        const parentIndex: string = item.split('-')[0]
        const childrenArr: Array<string> = item.split('-')
        let layerItem = layers[parentIndex]
        childrenArr.forEach((i, index) => {
          if (index === 0) {
            return
          }
          if (index === childrenArr.length - 1) {
            // 这里的图层只有矢量瓦片
            const layer = layerItem.currentStyle.layers[i]
            const visible =
              layer.layout === undefined ||
              layer.layout.visibility === undefined ||
              layer.layout.visibility === 'visible'
            if (layer.layout) {
              layer.layout.visibility = visible ? 'none' : 'visible'
            } else {
              layer.layout = {
                visibility: visible ? 'none' : 'visible'
              }
            }
          } else {
            layerItem = layerItem.sublayers[i]
          }
        })
      } else {
        layers[item].isVisible = !layers[item].isVisible
      }
    })
    this.document = doc
  }

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
