/* eslint-disable @typescript-eslint/no-for-in-array */
<template>
  <div class="tree-layer-container">
    <a-input-search
      ref="layerListFilter"
      enter-button
      placeholder="搜索图层"
      @search="onSearch"
      allowClear
    />
    <div class="tree-container beauty-scroll">
      <a-tree
        :checkedKeys="ticked"
        @check="tickedChange"
        :expanded-keys="expandedKeys"
        @expand="onExpand"
        checkable
        :tree-data="layers"
        block-node
        :selectedKeys="selectedKeys"
        :replaceFields="{
          children: 'sublayers'
        }"
      >
        <div slot="custom" slot-scope="item" class="tree-item-handle">
          <!-- wmts图层的子图层start ：当为wmts图层时，子图层是展示当前选中的图层， -->
          <a-icon
            v-if="
              item.layer && isWMTSLayer(item.layer) && isActiveWMTSLayer(item)
            "
            type="check-circle"
            :style="{ color: '#52c41a', fontSize: '16px' }"
          />
          <i
            v-else-if="
              item.layer && isWMTSLayer(item.layer) && !isActiveWMTSLayer(item)
            "
          />
          <!--------------------------- wmts图层的子图层end -------------------------->

          <!---------------------------- 图层的子图层start -------------------------->
          <a-tooltip
            v-if="
              filter !== '' &&
                item.title.toUpperCase().indexOf(filter.toUpperCase()) > -1
            "
          >
            <template v-if="item.description" slot="title">
              {{ item.description }}
            </template>
            <span :id="`tree_${item.key}`" @click="clickItem(item)">
              <!---------- 高亮查询查询结果start -------->
              <span>{{
                item.title.substr(
                  0,
                  item.title.toUpperCase().indexOf(filter.toUpperCase())
                )
              }}</span>
              <span class="filter-words">{{
                item.title.substr(
                  item.title.toUpperCase().indexOf(filter.toUpperCase()),
                  filter.length
                )
              }}</span>
              <span>{{
                item.title.substr(
                  item.title.toUpperCase().indexOf(filter.toUpperCase()) +
                    filter.length
                )
              }}</span>
              <!---------- 高亮查询查询结果end -------->
            </span>
          </a-tooltip>
          <a-tooltip v-else>
            <template v-if="item.description" slot="title">
              {{ item.description }}
            </template>
            <span :id="`tree_${item.key}`" @click="clickItem(item)">{{
              item.title
            }}</span>
          </a-tooltip>
          <!---------------------------- 图层的子图层end -------------------------->
          <a-popover
            v-if="showPopover(item)"
            placement="bottomLeft"
            arrow-point-at-center
            :visible="item.visiblePopover"
            trigger="click"
            @visibleChange="visible => clickPopover(item, visible)"
            overlayClassName="layer-list-popover"
          >
            <template slot="content">
              <right-popover
                v-if="!isVectorTileSubLayer(item)"
                :layer-item="item"
                @meta-data-info="metaDataInfo"
                @attributes="attributes"
                @custom-query="customQuery"
                @fit-bounds="fitBounds"
                @reset-tilematrix-set="resetTilematrixSet"
                @open-change-active-layer="openChangeActiveLayer"
                @to-top="toTop"
              />
              <slot
                v-else
                name="vector-tile-sublayer-popover"
                :layer="item"
              ></slot>
            </template>
            <a-icon type="more" class="more"></a-icon>
          </a-popover>
        </div>
      </a-tree>
    </div>
    <mp-window-wrapper :visible="showMetadataInfo">
      <template v-slot:default="slotProps">
        <mp-window
          title="元数据信息"
          :is-full-screen="true"
          :shrinkAction="false"
          :fullScreenAction="false"
          :icon="widgetInfo.icon"
          :visible.sync="showMetadataInfo"
          anchor="top-center"
          v-bind="slotProps"
        >
          <template>
            <mp-metadata-info :currentLayer="currentLayerInfo" />
          </template>
        </mp-window>
      </template>
    </mp-window-wrapper>

    <mp-window-wrapper :visible="showCustomQuery">
      <template v-slot:default="slotProps">
        <mp-window
          title="自定义查询"
          :width="550"
          :height="400"
          :icon="widgetInfo.icon"
          :visible.sync="showCustomQuery"
          anchor="top-center"
          v-bind="slotProps"
        >
          <template>
            <mp-custom-query
              :queryParams="queryParams"
              @close="onCloseCustomQuery"
            />
          </template>
        </mp-window>
      </template>
    </mp-window-wrapper>

    <mp-window-wrapper :visible="showSelectTilematrixSet">
      <template v-slot:default="slotProps">
        <mp-window
          title="切换矩阵集"
          :width="300"
          :icon="widgetInfo.icon"
          :visible.sync="showSelectTilematrixSet"
          anchor="center-center"
          v-bind="slotProps"
        >
          <template>
            <mp-select-tilematrix-set
              v-if="currentWmts"
              :layer="currentWmts"
              @update:layer="refreshCurrentWmts"
            />
          </template>
        </mp-window>
      </template>
    </mp-window-wrapper>

    <mp-window-wrapper :visible="showUnifyModify">
      <template v-slot:default="slotProps">
        <mp-window
          title="要素统改"
          :verticalOffset="10"
          :icon="widgetInfo.icon"
          :visible.sync="showUnifyModify"
          anchor="top-center"
          v-bind="slotProps"
        >
          <template>
            <mp-unify-modify :unifyModifyParams="unifyModifyParams" />
          </template>
        </mp-window>
      </template>
    </mp-window-wrapper>

    <mp-window-wrapper :visible="showChangeActiveLayer">
      <template v-slot:default="slotProps">
        <mp-window
          title="切换图层"
          :width="300"
          :icon="widgetInfo.icon"
          :visible.sync="showChangeActiveLayer"
          anchor="center-center"
          v-bind="slotProps"
        >
          <template>
            <mp-change-active-layer
              v-if="currentWmtsActiveLayer"
              :layer="currentWmtsActiveLayer"
              @update:layer="updateActiveLayer"
            />
          </template>
        </mp-window>
      </template>
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
  ExhibitionControllerMixin,
  Exhibition,
  LayerType,
  IGSMapImageLayer,
  IGSVectorLayer,
  OGCWMTSLayer,
  Sublayer,
  WMTSSublayer,
  CoordinateTransformation,
  CoordinateSystemType,
  Objects,
  IGSSceneSublayerRenderType,
  FitBound
} from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  dataCatalogManagerInstance
} from '@mapgis/pan-spatial-map-common'
import MpMetadataInfo from '../MetadataInfo/MetadataInfo.vue'
import MpCustomQuery from '../CustomQuery/CustomQuery.vue'
import MpUnifyModify from './components/UnifyModify/UnifyModify.vue'
import MpSelectTilematrixSet from './components/SelectTilematrixSet/SelectTilematrixSet.vue'
import MpChangeActiveLayer from './components/ChangeActiveLayer/ChangeActiveLayer.vue'
import layerTypeUtil from './mixin/layer-type-util'
import RightPopover from './components/RightPopover/index.vue'

const { IAttributeTableExhibition, AttributeTableExhibition } = Exhibition

@Component({
  components: {
    MpMetadataInfo,
    MpCustomQuery,
    MpUnifyModify,
    MpSelectTilematrixSet,
    MpChangeActiveLayer,
    RightPopover
  }
})
export default class MpTreeLayer extends Mixins(
  MapMixin,
  AppMixin,
  ExhibitionControllerMixin,
  layerTypeUtil
) {
  @Inject('CesiumZondy') CesiumZondy

  @Prop() widgetInfo!: Record<string, any>

  @Prop() layerDocument!: Record<string, any>

  private filter = ''

  private ticked: Array<string> = []

  private layers: Array = []

  private showMetadataInfo = false

  private showCustomQuery = false

  private queryParams: Record<string, any> = {}

  private currentLayerInfo: Record<string, unknown> = {}

  private showSelectTilematrixSet = false

  private expandedKeys = []

  // 记录可见状态为true的父节点的key
  private parentKeys: Array<string> = []

  // 当前选中的wmts图层的serverUrl
  currentWmts: WMTSSublayer = null

  showUnifyModify = false

  unifyModifyParams: Record<string, any> = {}

  showChangeActiveLayer = false

  currentWmtsActiveLayer: OGCWMTSLayer = null

  //  搜索功能，收到结果的  key的数组
  private searchkeyArr = []

  // 高亮搜索结果的下标
  private searchIndex = -1

  private get selectedKeys(): Array<string> {
    if (this.searchkeyArr.length > 0 && this.searchIndex > -1) {
      return [this.searchkeyArr[this.searchIndex]]
    }

    return []
  }

  @Watch('layerDocument.defaultMap', { deep: true, immediate: true })
  documentChange() {
    this.parentKeys = []
    if (
      this.layerDocument &&
      this.layerDocument.defaultMap &&
      this.layerDocument.defaultMap.layers()
    ) {
      const layers: Array<unknown> = this.layerDocument
        .clone()
        .defaultMap.layers()
      this.setDocument(layers)
      const arr = []
      for (let index = 0; index < layers.length; index++) {
        const item = layers[index]
        item.key = index.toString()
        item.scopedSlots = { title: 'custom' }
        item.visiblePopover = false
        if (this.isIGSScene(item)) {
          item.sublayers = item.activeScene.sublayers.map(row => ({
            ...row
          }))
        }

        if (this.isVectorTile(item)) {
          item.sublayers = item.currentStyle.layers.map(row => ({
            ...row,
            visible: !!(row.layout && row.layout.visibility === 'visible'),
            id: `${item.id}~${row.id}`,
            title: row.description || row.id
          }))
        }
        if (this.isWMTSLayer(item)) {
          if (item.isVisible || item.visible) {
            arr.push(item.key)
          }
        } else if (
          (item.sublayers && item.sublayers.length === 0) ||
          !item.sublayers
        ) {
          if (item.isVisible || item.visible) {
            arr.push(item.key)
          }
        } else if (item.sublayers && item.sublayers.length > 0) {
          /**
           * @修改说明
           * 这里存储visible或者为isVisible为true的父节点，因为这些可见的父节点并没有存储到ticked，
           * 后续点击check的点击事件返回的val会包含这些父节点无法做比较
           */
          if (item.isVisible || item.visible) {
            this.parentKeys.push(item.key)
          }
        }
        if (item.sublayers && item.sublayers.length > 0) {
          this.setSublayers(item.sublayers, item.key, arr)
        }
      }
      this.layers = layers
      this.ticked = arr
    }
  }

  @Watch('filter')
  filterChange(newVal, oldVal) {
    if (this.filter !== '') {
      const arr = []
      this.filterTreeNode(this.layers, arr)
      this.searchkeyArr = arr
      const parentArr = []
      arr.forEach(key => {
        const keyArr = key.split('-')
        keyArr.forEach((item, i) => {
          const keys = []
          for (let index = 0; index <= i; index++) {
            keys.push(keyArr[index])
          }
          parentArr.push(keys.join('-'))
        })
      })
      // 去除数组中重叠的key
      this.expandedKeys = Array.from(new Set(parentArr))
      if (newVal !== oldVal) {
        this.timer = setTimeout(() => {
          this.setSearchIndex()
        }, 700)
      }
    }
  }

  created() {
    this.sceneController = Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.viewer
    )
  }

  onSearch(val) {
    const time = this.filter === val
    if (time) {
      this.filter = val
      // 当延时操作还在进行时，取消滚动条滚动操作，防止searchIndex因为延时操作而产生bug
      if (!this.timer) {
        this.setSearchIndex()
      }
    } else {
      this.searchkeyArr = []
      this.searchIndex = -1
      this.filter = val
    }
  }

  setSearchIndex() {
    if (this.searchkeyArr.length > 0) {
      if (this.searchIndex >= this.searchkeyArr.length - 1) {
        this.searchIndex = 0
      } else {
        this.searchIndex++
      }
      const element = this.$el.querySelector(
        `#tree_${this.searchkeyArr[this.searchIndex]}`
      )
      if (element) {
        element.scrollIntoView()
      }
      this.timer = null
    }
  }

  filterTreeNode(layers, arr) {
    layers.forEach(item => {
      if (item.title.toUpperCase().indexOf(this.filter.toUpperCase()) > -1) {
        arr.push(item.key)
      }
      if (item.sublayers && item.sublayers.length > 0) {
        this.filterTreeNode(item.sublayers, arr)
      }
    })
  }

  /**
   * 点击树节点的回调函数
   */
  clickItem(node) {
    this.$emit('click-item', node)
  }

  setBackgroundColor(item) {
    if (
      this.searchkeyArr.length > 0 &&
      item.key === this.searchkeyArr[this.searchIndex]
    ) {
      return {
        backgroundColor: 'yellow'
      }
    }
    return null
  }

  //  没有这一步，手动控制展开的位置无法折叠
  onExpand(expandedKeys) {
    this.expandedKeys = expandedKeys
  }

  /**
   * 该函数，是为了处理，当父节点为visible可见性false，子节点visible为true，
   * 这边递归讲父节点visible为false的子节点visible全部修改为false
   */
  setDocument(layers) {
    // const layers = this.layerDocument.defaultMap.layers()
    for (let index = 0; index < layers.length; index++) {
      const item = layers[index]
      let parentVisible
      if (item.isVisible !== undefined) {
        parentVisible = item.isVisible
      } else if (item.visible !== undefined) {
        parentVisible = item.visible
      }
      if (item.sublayers && item.sublayers.length > 0) {
        this.changeSublayersVisible(item.sublayers, parentVisible)
      }
    }
  }

  changeSublayersVisible(sublayers: Array, parentVisible: boolean) {
    for (let index = 0; index < sublayers.length; index++) {
      const item = sublayers[index]
      if (item.layer && this.isWMTSLayer(item.layer)) {
        return
      }
      let subParentVisible
      if (item.isVisible !== undefined) {
        if (parentVisible === false) {
          item.isVisible = false
        }
        subParentVisible = item.isVisible
      } else if (item.visible !== undefined) {
        if (parentVisible === false) {
          item.visible = false
        }
        subParentVisible = item.visible
      }
      if (item.sublayers && item.sublayers.length > 0) {
        this.changeSublayersVisible(item.sublayers, subParentVisible)
      }
    }
  }

  tickedChange(val: Array<string>, e) {
    const includeHanlfCheckArrNew = val.concat(e.halfCheckedKeys)
    const includeHanlfCheckArrOld = this.ticked.concat(this.parentKeys)
    const doc = this.layerDocument.clone()
    const layers: Array<unknown> = doc.defaultMap.layers()
    // 查找出与前一次check不同的数据，相同数据则不用处理提升效率
    const diffArr: Array<string> = includeHanlfCheckArrNew
      .concat(includeHanlfCheckArrOld)
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
            if (this.isIGSScene(layerItem)) {
              layerItem.activeScene.sublayers[i].visible = !layerItem
                .activeScene.sublayers[i].visible
            } else if (this.isVectorTile(layers[parentIndex])) {
              const visible =
                (layerItem.currentStyle.layers[i].layout || {}).visibility ===
                'visible'
              if (layerItem.currentStyle.layers[i].layout) {
                layerItem.currentStyle.layers[i].layout.visibility = visible
                  ? 'none'
                  : 'visible'
              } else {
                layerItem.currentStyle.layers[i].layout = {
                  visibility: visible ? 'none' : 'visible'
                }
              }
            } else {
              layerItem.sublayers[i].visible = !layerItem.sublayers[i].visible
            }
          } else {
            if (this.isIGSScene(layerItem)) {
              layerItem = layerItem.activeScene.sublayers[i]
            } else {
              layerItem = layerItem.sublayers[i]
            }
          }
        })
      } else {
        layers[item].isVisible = !layers[item].isVisible
      }
    })
    // this.document = doc
    this.$emit('update:layerDocument', doc)
  }

  /**
   * @sublayers 子节点的数组
   * @id 父节点的key值
   * @arr 存储ticked的数组
   * @parentVisible 父节点的可见性
   */
  setSublayers(sublayers: Array, id: string, arr: Array<string>) {
    for (let index = 0; index < sublayers.length; index++) {
      const item = sublayers[index]
      item.key = `${id}-${index}`
      item.scopedSlots = { title: 'custom' }
      item.visiblePopover = false
      if (item.layer && this.isWMTSLayer(item.layer)) {
        item.checkable = false
        return
      }
      if ((item.sublayers && item.sublayers.length === 0) || !item.sublayers) {
        if (item.isVisible || item.visible) {
          arr.push(item.key)
        }
      } else if (item.sublayers && item.sublayers.length > 0) {
        /**
         * @修改说明
         * 这里存储visible或者为isVisible为true的父节点，因为这些可见的父节点并没有存储到ticked，
         * 后续点击check的点击事件返回的val会包含这些父节点无法做比较
         */
        if (item.isVisible || item.visible) {
          this.parentKeys.push(item.key)
        }
      }
      if (item.sublayers && item.sublayers.length > 0) {
        this.setSublayers(item.sublayers, item.key, arr)
      }
    }
  }

  fitBounds(item) {
    const { Cesium, map, viewer, CesiumZondy } = this
    const isOutOfRange = FitBound.fitBoundByLayer(
      item.dataRef,
      {
        Cesium,
        map,
        viewer,
        CesiumZondy
      },
      this.is2DMapMode === true
    )
    this.clickPopover(item, false)
    if (isOutOfRange) {
      this.$message.error('地图范围有误，已调整为经纬度最大范围')
    }
  }

  resetTilematrixSet(item) {
    this.showSelectTilematrixSet = true
    this.currentWmts = item.dataRef
    this.clickPopover(item, false)
  }

  openChangeActiveLayer(item) {
    this.showChangeActiveLayer = true
    this.currentWmtsActiveLayer = item.dataRef
    this.clickPopover(item, false)
  }

  toTop(item) {
    if (this.layerDocument && this.layerDocument.defaultMap) {
      const map = this.layerDocument.defaultMap
      const layer = map.findLayerById(item.id)
      map.remove(layer)
      map.add(layer)
      if (this.map.getLayer(item.id)) {
        this.map.moveLayer(item.id)
      }
    }
  }

  updateActiveLayer(val: OGCWMTSLayer) {
    const {
      key,
      activeLayer: { id }
    } = val
    const indexArr: Array<string> = key.split('-')
    const doc = this.layerDocument.clone()
    const layers: Array<unknown> = doc.defaultMap.layers()
    if (indexArr.length === 1) {
      const layerItem: OGCWMTSLayer = layers[indexArr[0]]
      // layerItem.activeLayer = val.activeLayer
      layerItem.activeLayer = layerItem.findSublayerById(id)
    }
    // this.document = doc
    this.$emit('update:layerDocument', doc)
  }

  refreshCurrentWmts(val) {
    const { tileMatrixSetId, tileMatrixSets } = val
    const { key } = val
    const indexArr = key.split('-')
    const doc = this.layerDocument.clone()
    const layers: Array<unknown> = doc.defaultMap.layers()
    let layerItem = layers[indexArr[0]]
    indexArr.forEach((i, index) => {
      if (index === 0) {
        return
      }
      if (index === indexArr.length - 1 && layerItem.sublayers[i]) {
        layerItem.sublayers[i].tileMatrixSetId = tileMatrixSetId
        layerItem.sublayers[i].tileMatrixSets = tileMatrixSets
      } else {
        layerItem = layerItem.sublayers[i]
      }
    })
    // this.document = doc
    this.$emit('update:layerDocument', doc)
  }

  unifyMode(layer) {
    this.showUnifyModify = true
    if (
      layer.dataRef.layer &&
      layer.dataRef.layer.type === LayerType.IGSMapImage
    ) {
      const parentLayer: IGSMapImageLayer = layer.dataRef.layer
      const sublayers: Sublayer = layer.dataRef
      const { ip, port, docName } = parentLayer._parseUrl(parentLayer.url)
      const { type } = parentLayer
      const { geomType, sysLibraryGuid, url, id, key } = sublayers

      this.unifyModifyParams = {
        id: key,
        ip: ip || baseConfigInstance.config.ip,
        port: Number(port || baseConfigInstance.config.port),
        serverName: docName,
        serverType: type,
        layerIndex: id,
        geomType,
        gdbps: url,
        sysLibraryGuid
      }
    }
    this.clickPopover(layer, false)
  }

  /**
   * 自定义查询
   */
  customQuery(layer) {
    this.showCustomQuery = true
    this.clickPopover(layer, false)
    const parent: IGSMapImageLayer = layer.layer
    if (parent && this.isIgsDocLayer(parent)) {
      const { ip, port, docName } = parent._parseUrl(parent.url)
      this.queryParams = {
        id: `${parent.title} ${layer.title} ${layer.id} 自定义查询`,
        name: `${layer.title} 自定义查询`,
        description: `${parent.title} ${layer.title}`,
        option: {
          id: layer.id,
          name: layer.title,
          ip: ip || baseConfigInstance.config.ip,
          port: Number(port || baseConfigInstance.config.port),
          serverType: parent.type,
          layerIndex: layer.id,
          serverName: docName,
          serverUrl: parent.url
        }
      }
    } else if (this.isIgsVectorLayer(layer)) {
      const igsVectorLayer: IGSVectorLayer = layer.dataRef
      const { ip, port, docName } = igsVectorLayer._parseUrl(layer.url)
      this.queryParams = {
        id: `${igsVectorLayer.title} ${igsVectorLayer.id} 自定义查询`,
        name: `${igsVectorLayer.title} 自定义查询`,
        option: {
          ip: ip || baseConfigInstance.config.ip,
          port: Number(port || baseConfigInstance.config.port),
          serverType: igsVectorLayer.type,
          gdbp: igsVectorLayer.gdbps
        }
      }
    } else if (this.isIGSScene(layer)) {
      const sceneLayer = layer.dataRef
      const { ip, port, docName } = sceneLayer.layer._parseUrl(
        sceneLayer.layer.url
      )
      const layerConfig = dataCatalogManagerInstance.getLayerConfigByID(
        sceneLayer.layer.id
      )
      if (layerConfig && layerConfig.bindData) {
        this.queryParams = {
          id: `${sceneLayer.title} ${sceneLayer.id} 自定义查询`,
          name: `${sceneLayer.title} 自定义查询`,
          option: {
            id: `${sceneLayer.id}`,
            ip: ip || baseConfigInstance.config.ip,
            port: Number(port || baseConfigInstance.config.port),
            serverType: sceneLayer.layer.type,
            gdbp: layerConfig.bindData.gdbps
          }
        }
      }
    } else if (this.isArcGISMapImage(layer)) {
      this.queryParams = {
        id: `${parent.title} ${layer.title} ${layer.id}`,
        name: `${layer.title} 属性表`,
        description: `${parent.title} ${layer.title}`,
        option: {
          id: layer.id,
          name: layer.title,
          serverType: parent.type,
          layerIndex: layer.id,
          serverUrl: parent.url
        }
      }
    }
  }

  /**
   * 查看属性
   */
  attributes(layer) {
    this.clickPopover(layer, false)
    const parent = layer.layer
    let exhibition: IAttributeTableExhibition = null
    if (parent && this.isIgsDocLayer(parent)) {
      const { ip, port, docName } = parent._parseUrl(parent.url)
      exhibition = {
        id: `${parent.title} ${layer.title} ${layer.id}`,
        name: `${layer.title} 属性表`,
        description: `${parent.title} ${layer.title}`,
        option: {
          id: layer.id,
          name: layer.title,
          ip: ip || baseConfigInstance.config.ip,
          port: Number(port || baseConfigInstance.config.port),
          serverType: parent.type,
          layerIndex: layer.id,
          serverName: docName,
          serverUrl: parent.url
        }
      }
    } else if (this.isIgsVectorLayer(layer)) {
      const igsVectorLayer: IGSVectorLayer = layer.dataRef
      const { ip, port, docName } = igsVectorLayer._parseUrl(layer.url)
      exhibition = {
        id: `${igsVectorLayer.title} ${igsVectorLayer.id}`,
        name: `${igsVectorLayer.title} 属性表`,
        option: {
          ip: ip || baseConfigInstance.config.ip,
          port: Number(port || baseConfigInstance.config.port),
          serverType: igsVectorLayer.type,
          gdbp: igsVectorLayer.gdbps
        }
      }
    } else if (this.isArcGISMapImage(layer)) {
      exhibition = {
        id: `${parent.title} ${layer.title} ${layer.id}`,
        name: `${layer.title} 属性表`,
        description: `${parent.title} ${layer.title}`,
        option: {
          id: layer.id,
          name: layer.title,
          serverType: parent.type,
          layerIndex: layer.id,
          serverUrl: parent.url
        }
      }
    } else if (this.isIGSScene(layer)) {
      const sceneLayer = layer.dataRef
      const { ip, port, docName } = parent._parseUrl(parent.url)
      const { id, name, title } = sceneLayer
      const layerConfig = dataCatalogManagerInstance.getLayerConfigByID(
        parent.id
      )
      if (layerConfig && layerConfig.bindData) {
        exhibition = {
          id: `${title} ${id}`,
          name: `${title} 属性表`,
          option: {
            id: `${id}`,
            ip: ip || baseConfigInstance.config.ip,
            port: Number(port || baseConfigInstance.config.port),
            serverType: parent.type,
            gdbp: layerConfig.bindData.gdbps
          }
        }
      }
    }
    if (exhibition) {
      this.addExhibition(new AttributeTableExhibition(exhibition))
      this.openExhibitionPanel()
    }
  }

  metaDataInfo(node) {
    const layer = node.dataRef
    if (this.isWMTSLayer(layer) || this.isWMSLayer(layer)) {
      window.open(layer.url)
    } else {
      this.showMetadataInfo = true
      this.currentLayerInfo = layer
    }

    this.clickPopover(node, false)
  }

  clickPopover(item, visible) {
    item.dataRef.visiblePopover = visible
    this.layers = [...this.layers]
  }

  onCloseCustomQuery() {
    this.showCustomQuery = false
  }
}
</script>

<style lang="less">
.tree-layer-container {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .tree-container {
    flex: 1 1 0%;
    overflow: auto;
    .tree-item-handle {
      display: flex;
      width: 100%;
      overflow: hidden;
      align-items: center;
      .filter-words {
        color: @primary-color;
      }
      .more {
        font-size: 16px;
        color: @text-color;
        margin-right: 0;
        &:hover {
          color: @primary-color;
        }
      }
      i {
        margin-right: 6px;
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      span {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
