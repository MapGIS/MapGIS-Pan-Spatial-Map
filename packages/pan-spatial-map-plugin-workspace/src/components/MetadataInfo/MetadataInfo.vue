<template>
  <div class="metadata-info-container">
    <MpMetadataInfoCloud
      v-if="currentConfig && !currentConfig.type && currentConfig.metaData"
      :metadata="currentConfig.metaData"
    >
    </MpMetadataInfoCloud>
    <a-spin :spinning="spinning" size="small">
      <template v-if="metadata">
        <div v-if="isIGSMapImage(currentLayer || currentConfig)">
          <mp-metadata-info-doc :metadata="metadata"></mp-metadata-info-doc>
        </div>
        <div v-if="isIGSTile(currentLayer || currentConfig)">
          <mp-metadata-info-tile :metadata="metadata"></mp-metadata-info-tile>
        </div>
        <div v-if="isIGSVector(currentLayer || currentConfig)">
          <mp-metadata-info-vector
            :metadata="metadata"
          ></mp-metadata-info-vector>
        </div>
        <div v-if="isIGSScene(currentLayer || currentConfig)">
          <mp-metadata-info-doc-3-d
            :metadata="metadata"
          ></mp-metadata-info-doc-3-d>
        </div>
        <div v-if="isArcgis(currentLayer || currentConfig)">
          <mp-metadata-info-arcgis
            :metadata="metadata"
          ></mp-metadata-info-arcgis>
        </div>
        <div v-if="isVectorTitle(currentLayer || currentConfig)">
          <mp-metadata-info-vector-title
            :metadata="metadata"
          ></mp-metadata-info-vector-title>
        </div>
      </template>
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
import { baseConfigInstance } from '@mapgis/pan-spatial-map-common'

import MpMetadataInfoDoc from './MetadataInfoDoc'
import MpMetadataInfoTile from './MetadataInfoTile'
import MpMetadataInfoVector from './MetadataInfoVector'
import MpMetadataInfoDoc3D from './MetadataInfoDoc3D'
import MpMetadataInfoArcgis from './MetadataInfoArcgis.vue'
import MpMetadataInfoVectorTitle from './MetadataInfoVectorTitle.vue'
import MpMetadataInfoCloud from './MetadataInfoCloud.vue'

@Component({
  name: 'MpMetadataInfo',
  components: {
    MpMetadataInfoDoc,
    MpMetadataInfoTile,
    MpMetadataInfoVector,
    MpMetadataInfoDoc3D,
    MpMetadataInfoArcgis,
    MpMetadataInfoVectorTitle,
    MpMetadataInfoCloud
  }
})
export default class MpMetadataInfo extends Vue {
  @Prop(Object) readonly currentLayer?: Record<string, any>

  @Prop(Object) readonly currentConfig?: Record<string, any>

  private metadata: Record<string, unknown> = null

  private tableColumns: Record<string, unknown>[] = []

  private spinning = false

  cloudMetaData() {
    return JSON.stringify(this.currentConfig.metaData)
  }

  @Watch('currentLayer', { deep: true, immediate: true })
  private async currentLayerChange() {
    if (this.currentLayer) {
      const { type } = this.currentLayer.layer || this.currentLayer
      if (!type || type === LayerType.OGCWMS || type === LayerType.OGCWMTS) {
        return
      }
      let option: Metadata.MetadataQueryParam = {}
      switch (type) {
        case LayerType.IGSScene: {
          let res
          if (this.currentLayer.layer) {
            res = this.currentLayer.layer._parseUrl(this.currentLayer.layer.url)
          } else {
            res = this.currentLayer._parseUrl(this.currentLayer.url)
          }
          const { ip, port, docName } = res
          option = { ip, port, docName, globe: true }
          break
        }
        case LayerType.IGSMapImage: {
          if (this.currentLayer.layer) {
            const { id } = this.currentLayer
            const { ip, port, docName } = this.currentLayer.layer._parseUrl(
              this.currentLayer.layer.url
            )
            option = { ip, port, docName, layerIdxs: id || '' }
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
        case LayerType.ArcGISMapImage:
        case LayerType.ArcGISTile: {
          const { url } = this.currentLayer
          option = { url }
          break
        }
        case LayerType.VectorTile: {
          const { url } = this.currentLayer
          option = { url }
          break
        }
        default:
          break
      }
      this.spinning = true
      if (type === LayerType.ArcGISMapImage || type === LayerType.ArcGISTile) {
        this.metadata = await Metadata.ArcGISMetadataQuery.getServiceInfo(
          option.url
        )
      } else if (type === LayerType.VectorTile) {
        this.metadata = await Metadata.VectorTileMetadataQuery.getServiceInfo(
          option.url
        )
      } else {
        this.metadata = await Metadata.MetaDataQuery.query(option)
      }
      this.spinning = false
    }
  }

  @Watch('currentConfig', { deep: true, immediate: true })
  private async currentConfigChange() {
    if (this.currentConfig) {
      const { type } = this.currentConfig
      if (!type || type === LayerType.OGCWMS || type === LayerType.OGCWMTS) {
        return
      }
      let option: Metadata.MetadataQueryParam = {}
      const defaultIp = baseConfigInstance.config.ip
      const defaultPort = baseConfigInstance.config.port

      switch (type) {
        case LayerType.IGSScene: {
          const serverName = this.currentConfig.serverName
          const ip = this.currentConfig.ip || defaultIp
          const port = this.currentConfig.port || defaultPort

          option = { ip, port, docName: serverName, globe: true }
          break
        }
        case LayerType.IGSMapImage: {
          const serverName = this.currentConfig.serverName
          const ip = this.currentConfig.ip || defaultIp
          const port = this.currentConfig.port || defaultPort
          option = { ip, port, docName: serverName }

          break
        }
        case LayerType.IGSTile: {
          const serverName = this.currentConfig.serverName
          const ip = this.currentConfig.ip || defaultIp
          const port = this.currentConfig.port || defaultPort
          option = { ip, port, tileName: serverName }
          break
        }
        case LayerType.IGSVector: {
          const gdbps = this.currentConfig.gdbps
          const ip = this.currentConfig.ip || defaultIp
          const port = this.currentConfig.port || defaultPort
          option = { ip, port, gdbp: gdbps }
          break
        }
        case LayerType.ArcGISMapImage:
        case LayerType.ArcGISTile: {
          const serverURL = this.currentConfig.serverURL
          option = { url: serverURL }
          break
        }
        case LayerType.VectorTile: {
          const serverURL = this.currentConfig.serverURL
          option = { url: serverURL }
          break
        }
        default:
          break
      }
      this.spinning = true
      if (type === LayerType.ArcGISMapImage || type === LayerType.ArcGISTile) {
        this.metadata = await Metadata.ArcGISMetadataQuery.getServiceInfo(
          option.url
        )
      } else if (type === LayerType.VectorTile) {
        this.metadata = await Metadata.VectorTileMetadataQuery.getServiceInfo(
          option.url
        )
      } else {
        this.metadata = await Metadata.MetaDataQuery.query(option)
      }
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

  isArcgis(item) {
    return (
      item.type === LayerType.ArcGISMapImage ||
      item.type === LayerType.ArcGISTile
    )
  }

  isIGSScene({ type, layer }) {
    let layerType = type
    if (layer) {
      layerType = layer.type
    }
    return layerType === LayerType.IGSScene
  }

  isVectorTitle(item) {
    return item.type === LayerType.VectorTile
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
        width: 150px;
        min-width: 150px;
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
