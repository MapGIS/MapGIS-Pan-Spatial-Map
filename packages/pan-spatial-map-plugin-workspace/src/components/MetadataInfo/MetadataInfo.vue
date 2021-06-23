<template>
  <div class="metadata-info-container">
    <a-spin :spinning="spinning" size="small">
      <div v-if="isIGSMapImage(currentLayer || currentConfig)">
        <mp-metadata-info-doc :metadata="metadata"></mp-metadata-info-doc>
      </div>
      <div v-if="isIGSTile(currentLayer || currentConfig)">
        <mp-metadata-info-tile :metadata="metadata"></mp-metadata-info-tile>
      </div>
      <div v-if="isIGSVector(currentLayer || currentConfig)">
        <mp-metadata-info-vector :metadata="metadata"></mp-metadata-info-vector>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import {
  LayerType,
  IGSMapImageLayer,
  IGSVectorLayer,
  IGSTileLayer,
  Layer,
  Metadata
} from '@mapgis/web-app-framework'

import MpMetadataInfoDoc from './MetadataInfoDoc'
import MpMetadataInfoTile from './MetadataInfoTile'
import MpMetadataInfoVector from './MetadataInfoVector'

@Component({
  name: 'MpMetadataInfo',
  components: { MpMetadataInfoDoc, MpMetadataInfoTile, MpMetadataInfoVector }
})
export default class MpMetadataInfo extends Vue {
  @Prop(Object) readonly currentLayer?: Record<string, any>

  @Prop(Object) readonly currentConfig?: Record<string, any>

  private metadata: Record<string, unknown> = {}

  private tableColumns: Record<string, unknown>[] = []

  private spinning = false

  @Watch('currentLayer', { deep: true, immediate: true })
  private async currentLayerChange() {
    if (this.currentLayer) {
      const { type } = this.currentLayer.layer || this.currentLayer
      if (type === LayerType.OGCWMS || type === LayerType.OGCWMTS) {
        return
      }
      let option: Metadata.MetadataQueryParam = {}
      switch (type) {
        case LayerType.IGSMapImage: {
          if (this.currentLayer.layer) {
            const { id } = this.currentLayer
            const { ip, port, docName } = this.currentLayer.layer._parseUrl(
              this.currentLayer.layer.url
            )
            option = { ip, port, docName, layerIdxs: id }
          } else {
            const { ip, port, docName } = this.currentLayer._parseUrl(
              this.currentLayer.url
            )
            option = { ip, port, docName }
          }

          break
        }
        case LayerType.IGSTile: {
          const { ip, port, tileName } = this.currentLayer._parseUrl(
            this.currentLayer.url
          )
          option = { ip, port, tileName }
          break
        }
        case LayerType.IGSVector: {
          const { gdbps } = this.currentLayer
          const { ip, port } = this.currentLayer._parseUrl(
            this.currentLayer.url
          )
          option = { ip, port, gdbp: gdbps }
          break
        }
        default:
          break
      }
      this.spinning = true
      this.metadata = await Metadata.MetaDataQuery.query(option)
      this.spinning = false
    }
  }

  @Watch('currentConfig', { deep: true, immediate: true })
  private async currentConfigChange() {
    if (this.currentConfig) {
      const { type } = this.currentConfig
      if (type === LayerType.OGCWMS || type === LayerType.OGCWMTS) {
        return
      }
      let option: Metadata.MetadataQueryParam = {}
      const { ip, port, serverName, gdbps } = this.currentConfig
      switch (type) {
        case LayerType.IGSMapImage: {
          option = { ip, port, docName: serverName }
          break
        }
        case LayerType.IGSTile: {
          option = { ip, port, tileName: serverName }
          break
        }
        case LayerType.IGSVector: {
          option = { ip, port, gdbp: gdbps }
          break
        }
        default:
          break
      }
      this.spinning = true
      this.metadata = await Metadata.MetaDataQuery.query(option)
      this.spinning = false
    }
  }

  isIGSVector(item) {
    return (
      item.type === LayerType.IGSVector ||
      (item.layer && item.layer.type === LayerType.IGSMapImage)
    )
  }

  isIGSTile(item) {
    return item.type === LayerType.IGSTile
  }

  isIGSMapImage(item) {
    return item.type === LayerType.IGSMapImage
  }
}
</script>

<style lang="less">
.metadata-info-container {
  .ant-tabs {
    .ant-tabs-bar {
      margin-bottom: 8px;
      .ant-tabs-tab {
        padding: 0 16px 8px 16px;
      }
    }
  }
  .info-body {
    padding-left: 15px;
    letter-spacing: 0.7px;
    word-break: break-word;
    word-wrap: break-word;
    white-space: normal;
    .info-item {
      display: flex;
      justify-content: flex-start;
      flex-flow: row nowrap;
      padding-bottom: 8px;
      &:last-child {
        padding-bottom: 0;
      }
      .info-item-title {
        display: block;
        width: 100px;
        min-width: 100px;
        margin-right: 20px;
        word-break: keep-all;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: @heading-color;
      }
    }
  }
}
</style>
