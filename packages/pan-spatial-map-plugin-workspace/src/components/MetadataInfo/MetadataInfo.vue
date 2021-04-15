<template>
  <div class="metadata-info-container">
    <div>
      <div v-if="isIGSMapImage(currentLayer || currentConfig)">
        <div
          v-for="(item, index) in getJsonTag(metaData)"
          :key="'地图文档' + item + index"
        >
          <div v-if="item !== '地图列表'" class="line">
            <label class="label">{{ `${item}：` }}</label>
            <span>{{ metaData[item] }}</span>
          </div>
          <div v-else>
            <div class="line">
              <label class="label">{{ `${item}` }}</label>
            </div>
            <div
              v-for="(mapInfo, m) in metaData[item]"
              :key="'地图文档地图列表' + m"
              class="sub-div"
            >
              <div
                v-for="(mapInfoItem, mi) in getJsonTag(mapInfo)"
                :key="'地图文档地图列表图层列表' + mapInfoItem + mi"
              >
                <div v-if="mapInfoItem !== '图层列表'" class="line">
                  <label class="label">{{ `${mapInfoItem}：` }}</label>
                  <span>{{ mapInfo[mapInfoItem] }}</span>
                </div>
                <div v-else>
                  <div class="line">
                    <label class="label">{{ `${mapInfoItem}` }}</label>
                  </div>
                  <a-table
                    bordered
                    size="small"
                    :scroll="{ x: 10, y: 240 }"
                    :pagination="false"
                    :data-source="mapInfo[mapInfoItem]"
                    :columns="getTableColumns(mapInfo[mapInfoItem][0])"
                    class="table"
                  >
                  </a-table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="isIGSTile(currentLayer || currentConfig)">
        <div
          v-for="(item, index) in getJsonTag(metaData)"
          :key="'瓦片' + item + index"
        >
          <div class="line" v-if="!isJSON(metaData[item])">
            <label class="label">{{ `${item}：` }}</label>
            <span>{{ metaData[item] }}</span>
          </div>
          <div v-else>
            <div class="line">
              <label class="label">{{ `${item}` }}</label>
            </div>
            <div
              v-for="(itemChild, childIndex) in getJsonTag(metaData[item])"
              :key="'瓦片' + item + itemChild + childIndex"
              class="line sub-div"
            >
              <div class="line" v-if="itemChild.indexOf('瓦片各级信息') === -1">
                <label class="label">{{ `${itemChild}：` }}</label>
                <span>{{ metaData[item][itemChild] }}</span>
              </div>
              <div v-else>
                <label class="label">{{ `${itemChild}` }}</label>
                <a-table
                  bordered
                  size="small"
                  :scroll="{ x: 10, y: 240 }"
                  :pagination="false"
                  :data-source="metaData[item][itemChild]"
                  :columns="getTableColumns(metaData[item][itemChild][0])"
                  class="table"
                >
                </a-table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="isIGSVector(currentLayer || currentConfig)">
        <div
          v-for="(item, index) in getJsonTag(metaData)"
          :key="'图层' + item + index"
        >
          <div class="line" v-if="!isJSON(metaData[item])">
            <label class="label">{{ `${item}：` }}</label>
            <span>{{ metaData[item] }}</span>
          </div>
          <div v-else>
            <label class="label">{{ `${item}` }}</label>
            <div
              v-for="(itemChild, childIndex) in getJsonTag(metaData[item])"
              :key="'图层' + item + itemChild + childIndex"
              class="sub-div"
            >
              <div class="line" v-if="itemChild.indexOf('属性描述') > -1">
                <div class="label">{{ `${itemChild}` }}</div>
                <a-table
                  bordered
                  size="small"
                  :scroll="{ x: 10, y: 240 }"
                  :pagination="false"
                  :data-source="metaData[item][itemChild]"
                  :columns="getTableColumns(metaData[item][itemChild][0])"
                  class="table"
                >
                </a-table>
              </div>
              <div class="line" v-else-if="!isJSON(metaData[item][itemChild])">
                <label class="label">{{ `${itemChild}：` }}</label>
                <span>{{ metaData[item][itemChild] }}</span>
              </div>
              <div v-else>
                <label class="label">{{ `${itemChild}` }}</label>
                <div
                  v-for="(itemChildChild, childChildIndex) in getJsonTag(
                    metaData[item][itemChild]
                  )"
                  :key="
                    '图层' + item + itemChild + itemChildChild + childChildIndex
                  "
                  class="sub-div"
                >
                  <div class="line">
                    <label class="label">{{ `${itemChildChild}：` }}</label>
                    <span>{{ metaData[item][itemChild][itemChildChild] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import {
  queryIGSMetaDataInstance,
  MetadataQueryParam,
  dataCatalogManagerInstance
} from '@mapgis/pan-spatial-map-store'
import {
  LayerType,
  IGSMapImageLayer,
  IGSVectorLayer,
  IGSTileLayer,
  Layer
} from '@mapgis/web-app-framework'
// import { IGSMapImageLayer } from 'app/packages/MapGIS-Web-App-Framework/src/store/document/layer'

@Component({ name: 'MpMetadataInfo', components: {} })
export default class MpMetadataInfo extends Vue {
  @Prop(Object) readonly currentLayer?: Record<string, any>

  @Prop(Object) readonly currentConfig?: Record<string, any>

  private metaData: Record<string, unknown> = {}

  private tableColumns: Record<string, unknown>[] = []

  @Watch('currentLayer', { deep: true, immediate: true })
  private async getMetadta() {
    if (this.currentLayer) {
      const { type } = this.currentLayer.layer || this.currentLayer
      if (type === LayerType.OGCWMS || type === LayerType.OGCWMTS) {
        return
      }
      let option: MetadataQueryParam = {}
      switch (type) {
        case LayerType.IGSMapImage: {
          if (this.currentLayer.layer) {
            // const currentLayer = this.currentLayer as IGSMapImageLayer
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
      this.metaData = await queryIGSMetaDataInstance.getMetadta(option)
      console.log(this.metaData)
    }
  }

  @Watch('currentConfig', { deep: true, immediate: true })
  private async getmetadata() {
    console.log(this.currentConfig)

    if (this.currentConfig) {
      const { type } = this.currentConfig
      if (type === LayerType.OGCWMS || type === LayerType.OGCWMTS) {
        return
      }
      let option: MetadataQueryParam = {}
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
      this.metaData = await queryIGSMetaDataInstance.getMetadta(option)
      console.log(this.metaData)
    }
  }

  getTableColumns(info: Record<string, unknown>) {
    const tags = this.getJsonTag(info)
    const columns: Record<string, unknown>[] = []
    for (let i = 0; i < tags.length; i += 1) {
      const obj = {
        align: 'center',
        title: tags[i],
        dataIndex: tags[i],
        key: tags[i],
        width: 180
      }
      columns.push(obj)
    }
    this.tableColumns = columns
    return columns
  }

  getJsonTag(data: Record<string, unknown>) {
    return Object.keys(data)
  }

  isJSON(data: any) {
    if (data) {
      return typeof data === 'object'
    }
    return false
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

<style lang="less" scoped>
.metadata-info-container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: #8c8c8c;
  white-space: normal !important;
  .label {
    color: #434343;
    font-weight: bold;
  }

  .table {
    width: 100%;
  }

  .line {
    margin-top: 4px;
  }

  .sub-div {
    margin-left: 1em;
  }
}
</style>
