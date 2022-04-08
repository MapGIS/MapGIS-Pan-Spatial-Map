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
          children: 'sublayers',
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
            @visibleChange="(visible) => clickPopover(item, visible)"
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
                @edit-data-flow-style="editDataFlowStyle"
                @change-m3d-props="changeM3DProps"
                @query="queryFeature"
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
            <mp-metadata-info
              v-if="showMetadataInfo"
              :currentLayer="currentLayerInfo"
            />
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
              v-if="showCustomQuery"
              :queryParams="queryParams"
              @close="onCloseCustomQuery"
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
  Mixins,
} from 'vue-property-decorator'
import {
  MapMixin,
  AppMixin,
  ExhibitionControllerMixin,
  Exhibition,
  LayerType,
  ModelCacheFormat,
  IGSMapImageLayer,
  IGSVectorLayer,
  OGCWMTSLayer,
  DataFlowLayer,
  Sublayer,
  WMTSSublayer,
  CoordinateTransformation,
  CoordinateSystemType,
  Objects,
  FitBound,
} from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  dataCatalogManagerInstance,
  events,
} from '@mapgis/pan-spatial-map-common'
import MpMetadataInfo from '../MetadataInfo/MetadataInfo.vue'
import MpCustomQuery from '../CustomQuery/CustomQuery.vue'
import MpUnifyModify from './components/UnifyModify/UnifyModify.vue'
import layerTypeUtil from './mixin/layer-type-util'
import RightPopover from './components/RightPopover/index.vue'

const { IAttributeTableExhibition, AttributeTableExhibition } = Exhibition

@Component({
  name: 'MpTreeLayer',
  components: {
    MpMetadataInfo,
    MpCustomQuery,
    MpUnifyModify,
    RightPopover,
  },
})
export default class MpTreeLayer extends Mixins(
  MapMixin,
  AppMixin,
  ExhibitionControllerMixin,
  layerTypeUtil
) {
  @Inject('vueCesium') vueCesium

  @Prop() widgetRouters

  @Prop() widgetInfo!: Record<string, any>

  @Prop() layerDocument!: Record<string, any>

  private filter = ''

  private ticked: Array<string> = []

  private layers: Array = []

  private showMetadataInfo = false

  private showCustomQuery = false

  private queryParams: Record<string, any> = {}

  // 右侧菜单栏选中的图层信息
  private currentLayerInfo: Record<string, unknown> = {}

  private expandedKeys = []

  // 记录可见状态为true的父节点的key
  private parentKeys: Array<string> = []

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

  @Watch('layerDocument.defaultMap', { immediate: true, deep: true })
  documentChange() {
    this.parentKeys = []
    this.resetWidgetRouters()
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
          if (item.activeScene) {
            item.sublayers = item.activeScene.sublayers.map((row) => ({
              ...row,
            }))
          }
        }

        if (this.isVectorTile(item)) {
          /**
           * 修改说明：矢量瓦片里的layers没有row.layout或者没有row.layout.visibility字段时，是默认显示，这里默认设置为可见
           * 修改人：龚跃健
           * 修改日期：2021/11/25
           */
          item.sublayers = item.currentStyle.layers.map((row) => ({
            ...row,
            visible:
              row.layout === undefined ||
              row.layout.visibility === undefined ||
              row.layout.visibility === 'visible',
            id: `${item.id}~${row.id}`,
            title: row.description || row.id,
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
      arr.forEach((key) => {
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
      this.vueCesium,
      this.viewer
    )
  }

  mounted() {
    this.$root.$on(events.SCENE_LOADEN_ON_MAP, this.sceneLoadedCallback)
  }

  /**
   * 当正在编辑图层被取消的时候，复位图层树路由
   */
  resetWidgetRouters() {
    let layer
    if (
      this.currentLayerInfo &&
      this.layerDocument &&
      this.layerDocument.defaultMap &&
      this.layerDocument.defaultMap.layers() &&
      this.layerDocument.defaultMap.layers().length > 0
    ) {
      layer = this.layerDocument.defaultMap.findLayerById(
        this.currentLayerInfo.id
      )
    }
    if (!layer && this.widgetRouters && this.widgetRouters.length > 1) {
      this.widgetRouters.splice(1)
    }
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
    layers.forEach((item) => {
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
        backgroundColor: 'yellow',
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
      .filter(function (v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v)
      })
    this.$emit('changed', diffArr)
    diffArr.forEach((item) => {
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
              if (layerItem.activeScene) {
                layerItem.activeScene.sublayers[i].visible =
                  !layerItem.activeScene.sublayers[i].visible
              }
            } else if (this.isVectorTile(layers[parentIndex])) {
              /**
               * 修改说明：矢量瓦片里的layers没有row.layout或者没有row.layout.visibility字段时，是默认显示，这里默认设置为可见
               * 修改人：龚跃健
               * 修改日期：2021/11/25
               */
              const layer = layerItem.currentStyle.layers[i]
              const visible =
                layer.layout === undefined ||
                layer.layout.visibility === undefined ||
                layer.layout.visibility === 'visible'
              if (layer.layout) {
                layer.layout.visibility = visible ? 'none' : 'visible'
              } else {
                layer.layout = {
                  visibility: visible ? 'none' : 'visible',
                }
              }
            } else {
              layerItem.sublayers[i].visible = !layerItem.sublayers[i].visible
            }
          } else {
            if (this.isIGSScene(layerItem)) {
              if (layerItem.activeScene) {
                layerItem = layerItem.activeScene.sublayers[i]
              }
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

  /**
   * 三维模型缓存加载完后的回调
   */
  sceneLoadedCallback(id) {
    const layers = [...this.layers]
    const vm = this
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i]
      if (layer.id === id && layer.type === LayerType.ModelCache) {
        let source
        if (layer.format === ModelCacheFormat.m3d) {
          source = vm.sceneController.findM3DIgsSource(id)
        } else if (layer.format === ModelCacheFormat.cesium3dTileset) {
          source = vm.sceneController.findTileset3DSource(id)
        }
        // console.log(source)
        source.readyPromise.then(() => {
          // console.log(source)
          const extent = vm._getM3DSetRange(source)
          // console.log(extent)
          for (let j = 0; j < vm.layers.length; j++) {
            if (vm.layers[j].id === id) {
              vm.layers[j].fullExtent.xmin = extent.xmin
              vm.layers[j].fullExtent.ymin = extent.ymin
              vm.layers[j].fullExtent.xmax = extent.xmax
              vm.layers[j].fullExtent.ymax = extent.ymax
            }
          }
        })
        break
      }
    }
  }

  /**
   * 获取m3d经纬度包围盒
   */
  _getM3DSetRange(m3dSet) {
    const { Cesium } = this
    // 如果模型未加载完，这里transform为undefined
    const transform = m3dSet._transform
    if (!transform) {
      return null
    }
    const inverseMatrix = Cesium.Matrix4.inverse(
      transform,
      new Cesium.Matrix4()
    )
    // 东北角
    const northeastCornerCartesian =
      m3dSet._root.boundingVolume.northeastCornerCartesian
    const northeastCornerDegree = this._degreeFromCartesian(
      northeastCornerCartesian
    )
    const xmax = northeastCornerDegree.longitude
    const ymax = northeastCornerDegree.latitude

    // 西南角
    const southwestCornerCartesian =
      m3dSet._root.boundingVolume.southwestCornerCartesian
    const southwestCornerDegree = this._degreeFromCartesian(
      southwestCornerCartesian
    )

    const xmin = southwestCornerDegree.longitude
    const ymin = southwestCornerDegree.latitude

    const zmin = m3dSet._root.boundingVolume.minimumHeight
    const zmax = m3dSet._root.boundingVolume.maximumHeight
    return { xmin, ymin, xmax, ymax, zmin, zmax }
  }

  /**
   * 笛卡尔坐标转世界坐标
   */
  _degreeFromCartesian(p) {
    if (!p) return
    const { Cesium } = this
    const point = {}
    const cartographic = Cesium.Cartographic.fromCartesian(p)
    point.longitude = Cesium.Math.toDegrees(cartographic.longitude)
    point.latitude = Cesium.Math.toDegrees(cartographic.latitude)
    point.height = cartographic.height // 模型高度
    return point
  }

  fitBounds(item, layeExtent) {
    const { Cesium, map, viewer, vueCesium } = this
    const isOutOfRange = FitBound.fitBoundByLayer(
      item.dataRef,
      {
        Cesium,
        map,
        viewer,
        vueCesium,
      },
      this.is2DMapMode === true,
      layeExtent
    )
    this.clickPopover(item, false)
    if (isOutOfRange) {
      this.$message.error('地图范围有误，已调整为经纬度最大范围')
    }
  }

  resetTilematrixSet(item) {
    this.currentLayerInfo = item.dataRef
    this.clickPopover(item, false)
    this.openPage({
      title: '切换矩阵集',
      name: 'MpSelectTilematrixSet',
      component: () =>
        import('./components/SelectTilematrixSet/SelectTilematrixSet.vue'),
      props: {
        layer: this.currentLayerInfo,
      },
      listeners: {
        'update:layer': this.refreshCurrentWmts,
      },
    })
  }

  editDataFlowStyle(item) {
    this.currentLayerInfo = item.dataRef
    this.clickPopover(item, false)
    this.openPage({
      title: '编辑样式',
      name: 'MpEditDataFlowStyle',
      component: () => import('./components/EditDataFlowStyle'),
      props: {
        layer: this.currentLayerInfo,
        baseUrl: this.baseUrl,
      },
      listeners: {
        'update:layer': this.updateDataFlowStyle,
      },
    })
  }

  queryFeature() {}

  /**
   * 打开M3D编辑属性页面
   */
  changeM3DProps(item) {
    this.currentLayerInfo = item.dataRef
    this.clickPopover(item, false)
    this.openPage({
      title: '属性编辑',
      name: 'MpChangeM3DProps',
      component: () => import('./components/ChangeM3DProps/ChangeM3DProps.vue'),
      props: {
        layer: this.currentLayerInfo,
      },
      listeners: {
        'update:layer': this.updateM3DProps,
      },
    })
  }

  /**
   * 打开wmts切换激活图层页面
   */
  openChangeActiveLayer(item) {
    this.currentLayerInfo = item.dataRef
    this.clickPopover(item, false)
    this.openPage({
      title: '切换图层',
      name: 'MpChangeActiveLayer',
      component: () =>
        import('./components/ChangeActiveLayer/ChangeActiveLayer.vue'),
      props: {
        layer: this.currentLayerInfo,
      },
      listeners: {
        'update:layer': this.updateActiveLayer,
      },
    })
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

  updateDataFlowStyle(val: DataFlowLayer) {
    const { key, layerStyle } = val
    const doc = this.layerDocument.clone()
    const layers: Array<unknown> = doc.defaultMap.layers()
    const layerItem: DataFlowLayer = layers[key]
    layerItem.setLayerStyle(layerStyle)
    this.$emit('update:layerDocument', doc)
    this.currentLayerInfo = {}
  }

  updateM3DProps(val) {
    let popupEnabled
    let modelSwitchEnabled
    const { key, maximumScreenSpaceError, layer, id } = val
    if (layer) {
      popupEnabled = layer.popupEnabled
    } else {
      popupEnabled = val.popupEnabled
      modelSwitchEnabled = val.modelSwitchEnabled
    }
    const indexArr: Array<string> = key.split('-')
    const doc = this.layerDocument.clone()
    const layers: Array<unknown> = doc.defaultMap.layers()
    if (indexArr.length === 2 || this.isModelCacheLayer(val)) {
      const [firstIndex, secondIndex] = indexArr
      if (indexArr.length === 2) {
        const sublayer = layers[firstIndex].activeScene.sublayers[secondIndex]
        sublayer.maximumScreenSpaceError = maximumScreenSpaceError
        sublayer.layer.popupEnabled = popupEnabled
        const m3d = this.sceneController.findSource(id)
        m3d.maximumScreenSpaceError = maximumScreenSpaceError
        // m3d.enablePopup = enablePopup
        this.$emit('update:layerDocument', doc)
      } else {
        const MC = layers[firstIndex]
        MC.maximumScreenSpaceError = maximumScreenSpaceError
        MC.popupEnabled = popupEnabled
        MC.modelSwitchEnabled = modelSwitchEnabled
        this.$emit('update:layerDocument', doc)
      }
    }
    this.currentLayerInfo = {}
  }

  updateActiveLayer(val: OGCWMTSLayer) {
    const {
      key,
      activeLayer: { id },
    } = val
    const indexArr: Array<string> = key.split('-')
    const doc = this.layerDocument.clone()
    const layers: Array<unknown> = doc.defaultMap.layers()
    if (indexArr.length === 1) {
      const layerItem: OGCWMTSLayer = layers[indexArr[0]]
      // layerItem.activeLayer = val.activeLayer
      layerItem.activeLayer = layerItem.findSublayerById(id)
    }
    this.$emit('update:layerDocument', doc)
    this.currentLayerInfo = {}
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
    this.$emit('update:layerDocument', doc)
    this.currentLayerInfo = {}
  }

  /**
   * 自定义查询
   */
  async customQuery(layer) {
    this.showCustomQuery = true
    this.clickPopover(layer, false)
    const exhibition = await this.getExhibition(layer, '自定义查询')
    if (exhibition) {
      this.queryParams = exhibition
    }
  }

  /**
   * 查看属性
   */
  async attributes(layer) {
    this.clickPopover(layer, false)
    const exhibition = await this.getExhibition(layer, '属性表')
    if (exhibition) {
      this.addExhibition(new AttributeTableExhibition(exhibition))
      this.openExhibitionPanel()
    }
  }

  /**
   * 打开新的router页面
   */
  openPage(router) {
    this.$nextTick(() => {
      this.widgetRouters.push(router)
    })
  }

  metaDataInfo(node) {
    const layer = node.dataRef
    if (this.isWMTSLayer(layer) || this.isWMSLayer(layer)) {
      window.open(layer.url)
    } else {
      this.showMetadataInfo = true
      this.currentLayerInfo = layer
    }
    // 复位当前选择的图层
    // this.$nextTick(() => {
    //   this.currentLayerInfo = {}
    // })
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
