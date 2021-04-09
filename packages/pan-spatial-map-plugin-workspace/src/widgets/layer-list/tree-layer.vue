/* eslint-disable @typescript-eslint/no-for-in-array */
<template>
  <div class="tree-layer-container">
    <a-input-search
      ref="layerListFilter"
      v-model="filter"
      placeholder="搜索图层"
      allowClear
    />
    <a-tree
      :checkedKeys="ticked"
      @check="tickedChange"
      checkable
      :tree-data="layers"
      block-node
      :selectable="false"
      :replaceFields="{
        children: 'sublayers'
      }"
    >
      <div slot="custom" slot-scope="item" class="tree-item-handle">
        <span v-if="item.title.indexOf(filter) > -1">
          {{ item.title.substr(0, item.title.indexOf(filter)) }}
          <span style="color:#1890ff">{{ filter }}</span>
          {{ item.title.substr(item.title.indexOf(filter) + filter.length) }}
        </span>
        <span v-else>{{ item.title }}</span>
        <a-popover
          placement="bottomLeft"
          arrow-point-at-center
          :visible="item.visiblePopover"
          trigger="click"
          @visibleChange="visible => clickPopover(item, visible)"
          overlayClassName="layer-list-popover"
        >
          <a-list slot="content" :gutter="10">
            <a-list-item
              v-if="!isIgsArcgisLayer(item)"
              @click="metaDataInfo(item)"
            >
              图层元数据
            </a-list-item>
            <a-list-item
              v-if="isSubLayer(item) || isIgsVectorLayer(item)"
              @click="attributes(item)"
            >
              查看属性
            </a-list-item>
            <a-list-item
              v-if="isSubLayer(item) || isIgsVectorLayer(item)"
              @click="customQuery(item)"
            >
              自定义查询
            </a-list-item>
            <a-list-item
              v-if="
                (isSubLayer(item) && !isIgsArcgisLayer(item)) ||
                  isIgsVectorLayer(item)
              "
              @click="unifyMode(item)"
            >
              要素统改
            </a-list-item>
            <a-list-item v-if="!isSubLayer(item)" @click="fitBounds(item)">
              缩放至
            </a-list-item>
            <a-list-item
              v-if="isWMTSLayer(item)"
              @click="resetTilematrixSet(item)"
            >
              切换矩阵集
            </a-list-item>
          </a-list>
          <a-button @click.stop size="small" type="link">
            <a-icon
              type="ellipsis"
              :style="{ fontSize: '22px', color: 'gray' }"
            >
            </a-icon>
          </a-button>
        </a-popover>
      </div>
    </a-tree>
    <mp-window-wrapper :visible="showMetadataInfo">
      <mp-window
        title="元数据信息"
        :width="550"
        :height="400"
        :theme-style="themeStyle"
        :icon="widgetInfo.icon"
        :visible.sync="showMetadataInfo"
        :position="'top'"
      >
        <template>
          <mp-metadata-info :currentLayerInfo="currentLayerInfo" />
        </template>
      </mp-window>
    </mp-window-wrapper>

    <mp-window-wrapper :visible="showCustomQuery">
      <mp-window
        title="自定义查询"
        :width="550"
        :height="400"
        :theme-style="themeStyle"
        :icon="widgetInfo.icon"
        :visible.sync="showCustomQuery"
        :anchor="'top'"
      >
        <template>
          <mp-custom-query :queryParams="queryParams" />
        </template>
      </mp-window>
    </mp-window-wrapper>

    <mp-window-wrapper :visible="showSelectTilematrixSet">
      <mp-window
        title="切换矩阵集"
        :width="300"
        :height="60"
        :theme-style="themeStyle"
        :icon="widgetInfo.icon"
        :visible.sync="showSelectTilematrixSet"
        :anchor="'top'"
      >
        <template>
          <mp-select-tilematrix-set
            :layer="currentWmts"
            @update:layer="refreshCurrentWmts"
          />
        </template>
      </mp-window>
    </mp-window-wrapper>

    <mp-window-wrapper :visible="showUnifyModify">
      <mp-window
        title="要素统改"
        :width="300"
        :height="400"
        :theme-style="themeStyle"
        :icon="widgetInfo.icon"
        :visible.sync="showUnifyModify"
        :anchor="'top'"
      >
      </mp-window>
    </mp-window-wrapper>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Watch,
  Inject,
  Mixins
} from 'vue-property-decorator'
import {
  MapMixin,
  AppMixin,
  LayerType,
  IGSMapImageLayer,
  IGSVectorLayer,
  OGCWMTSLayer
} from '@mapgis/web-app-framework'
import {
  ResultSetMixin,
  IResultSetCategory,
  baseConfigInstance,
  queryFeaturesInstance,
  dataCatalogInstance,
  queryOGCInfoInstance,
  queryArcgisInfoInstance
} from '@mapgis/pan-spatial-map-store'
import MpMetadataInfo from '../../components/MetadataInfo/MetadataInfo.vue'
import MpCustomQuery from '../../components/CustomQuery/CustomQuery.vue'
// import MpUnifyModify from '../../components/UnifyModify/UnifyModify.vue'
import MpSelectTilematrixSet from './components/SelectTilematrixSet/SelectTilematrixSet.vue'

@Component({
  components: {
    MpMetadataInfo,
    MpCustomQuery,
    // MpUnifyModify,
    MpSelectTilematrixSet
  }
})
export default class TreeLayer extends Mixins(
  MapMixin,
  AppMixin,
  ResultSetMixin
) {
  @Prop() widgetInfo: Record<string, any>

  private filter = ''

  private ticked: Array<string> = []

  private layers: Array = []

  private showMetadataInfo = false

  private showCustomQuery = false

  private queryParams: Record<string, any> = {}

  private currentLayerInfo: Record<string, unknown> = {}

  private showSelectTilematrixSet = false

  // 记录半勾选的key
  private halfCheckedKeys: Array<string> = []

  // 当前选中的wmts图层的serverUrl
  currentWmts: OGCWMTSLayer = null

  showUnifyModify = false

  unifyModifyParams: Record<string, any> = {}

  @Watch('document.defaultMap', { deep: true, immediate: true })
  documentChange() {
    const layers: Array<unknown> = this.document.clone().defaultMap.layers()
    const arr = []
    for (let index = 0; index < layers.length; index++) {
      const item = layers[index]
      item.key = index.toString()
      item.scopedSlots = { title: 'custom' }
      item.visiblePopover = false
      if (
        !this.halfCheckedKeys.includes(item.key) &&
        (item.isVisible || item.visible)
      ) {
        arr.push(item.key)
      }
      if (item.sublayers && item.sublayers.length > 0) {
        this.setSublayers(item.sublayers, item.key, arr)
      }
    }
    this.layers = layers
    this.ticked = arr
    this.halfCheckedKeys = []
  }

  tickedChange(val: Array<string>, e) {
    const includeHanlfCheckArr = val.concat(e.halfCheckedKeys)
    const doc = this.document.clone()
    const layers: Array<unknown> = doc.defaultMap.layers()
    // 查找出与前一次check不同的数据，相同数据则不用处理提升效率
    const diffArr: Array<string> = includeHanlfCheckArr
      .concat(this.ticked)
      .filter(function(v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v)
      })
    diffArr.forEach(item => {
      if (item.split('-').length > 1) {
        const parentIndex: string = item.split('-')[0]
        const childrenArr: Array<string> = item.split('-')
        let layerItem = layers[parentIndex]
        childrenArr.forEach((i, index) => {
          if (index === 0) {
            return
          }
          if (index === childrenArr.length - 1) {
            layerItem.sublayers[i].visible = !layerItem.sublayers[i].visible
          } else {
            layerItem = layerItem.sublayers[i]
          }
        })
      } else {
        layers[item].isVisible = !layers[item].isVisible
      }
    })
    this.document = doc
    this.halfCheckedKeys = e.halfCheckedKeys
    // this.ticked = val
  }

  setSublayers(sublayers: Array, id: string, arr: Array<string>) {
    for (let index = 0; index < sublayers.length; index++) {
      const item = sublayers[index]
      item.key = `${id}-${index}`
      item.scopedSlots = { title: 'custom' }
      item.visiblePopover = false
      if (
        !this.halfCheckedKeys.includes(item.key) &&
        (item.isVisible || item.visible)
      ) {
        arr.push(item.key)
      }
      if (item.sublayers && item.sublayers.length > 0) {
        this.setSublayers(item.sublayers, item.key, arr)
      }
    }
  }

  fitBounds(item) {
    const {
      fullExtent: { xmin, xmax, ymin, ymax }
    } = item
    if (this.is2DMapMode) {
      this.map.fitBounds([xmin, ymin, xmax, ymax])
    }
    this.clickPopover(item, false)
  }

  resetTilematrixSet(item) {
    this.showSelectTilematrixSet = true
    this.currentWmts = item.dataRef
    this.clickPopover(item, false)
  }

  refreshCurrentWmts(val) {
    const {
      activeLayer: { tileMatrixSetId, tileMatrixSets }
    } = val
    const { key } = val
    const indexArr = key.split('-')
    const doc = this.document.clone()
    const layers: Array<unknown> = doc.defaultMap.layers()
    if (indexArr.length <= 1) {
      layers[key].activeLayer.tileMatrixSetId = tileMatrixSetId
      layers[key].activeLayer.tileMatrixSets = tileMatrixSets
    } else {
      let layerItem = layers[indexArr[0]]
      indexArr.forEach((i, index) => {
        if (index === 0) {
          return
        }
        if (
          index === indexArr.length - 1 &&
          layerItem.sublayers[i].activeLayer
        ) {
          layerItem.sublayers[i].activeLayer.tileMatrixSetId = tileMatrixSetId
          layerItem.sublayers[i].activeLayer.tileMatrixSets = tileMatrixSets
        } else {
          layerItem = layerItem.sublayers[i]
        }
      })
    }
    this.document = doc
  }

  unifyMode(layer) {
    this.showUnifyModify = true
    this.unifyModifyParams = {
      id: layer.id,
      ip: layer.ip || baseConfigInstance.config.ip,
      port: Number(layer.port || baseConfigInstance.config.port),
      serverName: layer.serverName,
      serverType: layer.serverType,
      serverUrl: layer.serverUrl,
      subtype: layer.subtype,
      name: layer.name!,
      layerIndex: layer.layerIndex,
      geomType: layer.geomType,
      gdbps: layer.gdbps,
      sysLibraryGuid: layer.sysLibraryGuid
    }
    this.clickPopover(layer, false)
  }

  /**
   * 自定义查询
   */
  customQuery(layer) {
    console.log(layer)
    this.showCustomQuery = true
    this.clickPopover(layer, false)
    const parent: IGSMapImageLayer = layer.layer
    if (
      parent &&
      this.isIgsDocLayer(parent)
      // TODO：新版document的暂时还没有封装RasterArcgisLayer，这里留着以后做
      //  ||
      // parent.subtype === SubLayerType.RasterArcgisLayer
    ) {
      const { ip, port, docName } = parent._parseUrl(parent.url)
      this.queryParams = {
        id: parent.id,
        label: parent.title,
        tables: [
          {
            label: layer.title,
            layerIndex: layer.id,
            id: layer.id,
            ip: ip || baseConfigInstance.config.ip,
            port: Number(port || baseConfigInstance.config.port),
            serverName: docName,
            serverType: parent.type,
            serverUrl: parent.url
          }
        ]
      }
    } else if (this.isIgsVectorLayer(layer)) {
      const iGSVectorLayer: IGSVectorLayer = layer.dataRef
      const { ip, port, docName } = iGSVectorLayer._parseUrl(layer.url)
      this.queryParams = {
        id: iGSVectorLayer.id,
        label: iGSVectorLayer.title,
        ip: ip || baseConfigInstance.config.ip,
        port: Number(port || baseConfigInstance.config.port),
        serverType: iGSVectorLayer.type,
        gdbp: iGSVectorLayer.gdbps,
        tables: []
      }
    }
  }

  /**
   * 查看属性
   */
  attributes(layer) {
    this.clickPopover(layer, false)
    const parent: IGSMapImageLayer = layer.layer
    let categoryInfo: IResultSetCategory = null
    if (
      parent &&
      this.isIgsDocLayer(parent)
      // TODO：新版document的暂时还没有封装RasterArcgisLayer，这里留着以后做
      //  ||
      // parent.subtype === SubLayerType.RasterArcgisLayer
    ) {
      const { ip, port, docName } = parent._parseUrl(parent.url)
      categoryInfo = {
        id: parent.id,
        label: parent.title,
        tables: [
          {
            label: layer.title,
            layerIndex: layer.id,
            id: layer.id,
            ip: ip || baseConfigInstance.config.ip,
            port: Number(port || baseConfigInstance.config.port),
            serverName: docName,
            serverType: parent.type,
            serverUrl: parent.url
          }
        ]
      }
    } else if (this.isIgsVectorLayer(layer)) {
      const iGSVectorLayer: IGSVectorLayer = layer.dataRef
      const { ip, port, docName } = iGSVectorLayer._parseUrl(layer.url)
      categoryInfo = {
        id: iGSVectorLayer.id,
        label: iGSVectorLayer.title,
        ip: ip || baseConfigInstance.config.ip,
        port: Number(port || baseConfigInstance.config.port),
        serverType: iGSVectorLayer.type,
        gdbp: iGSVectorLayer.gdbps,
        tables: []
      }
    }
    const category = this.addCategory(categoryInfo)
    this.currentCategoryId = category.id
    this.openAttributeTable()
  }

  metaDataInfo(node) {
    const layer = node.dataRef
    this.showMetadataInfo = true
    this.currentLayerInfo = layer
    this.clickPopover(node, false)
  }

  clickPopover(item, visible) {
    item.dataRef.visiblePopover = visible
    this.layers = [...this.layers]
  }

  isSubLayer({ key }) {
    return key.split('-').length > 1
  }

  isIgsVectorLayer({ type }) {
    return type === LayerType.IGSVector
  }

  isIgsTileLayer({ type }) {
    return type === LayerType.IGSTile
  }

  isIgsDocLayer({ type }) {
    return type === LayerType.IGSMapImage
  }

  isWMTSLayer({ type }) {
    return type === LayerType.OGCWMTS
  }

  isIgsArcgisLayer({ type }) {
    return false
  }
}
</script>

<style lang="less" scoped>
.tree-layer-container {
  padding: 0 10px;
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
