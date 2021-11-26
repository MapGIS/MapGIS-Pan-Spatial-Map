<template>
  <a-list :gutter="10">
    <!-- <a-list-item v-if="isMetaData(layerItem)" @click="metaDataInfo">
      图层元数据
    </a-list-item>
    <a-list-item v-if="isAttributes(layerItem)" @click="attributes">
      查看属性
    </a-list-item>
    <a-list-item
      v-if="isAttributes(layerItem) && !isDataFlow(layerItem)"
      @click="customQuery"
    >
      自定义查询
    </a-list-item>
    <a-list-item v-if="isDataFlow(layerItem)" @click="editDataFlowStyle">
      编辑样式
    </a-list-item>
    <a-list-item v-if="isFitbound(layerItem)" @click="fitBounds">
      缩放至
    </a-list-item>
    <a-list-item
      v-if="
        layerItem.layer &&
          isWMTSLayer(layerItem.layer) &&
          isActiveWMTSLayer(layerItem)
      "
      @click="resetTilematrixSet"
    >
      切换矩阵集
    </a-list-item>
    <a-list-item
      v-if="isParentLayer(layerItem) && isWMTSLayer(layerItem)"
      @click="openChangeActiveLayer"
    >
      切换图层
    </a-list-item>
    <a-list-item
      v-if="isParentLayer(layerItem) && !isIGSScene(layerItem)"
      @click="toTop"
    >
      置顶
    </a-list-item> -->
    <template v-for="item in listData">
      <a-list-item :key="item.name" v-if="item.show" @click="item.click">
        {{ item.name }}
      </a-list-item>
    </template>
  </a-list>
</template>

<script lang="ts">
import { Component, Vue, Mixins, Prop } from 'vue-property-decorator'
import layerTypeUtil from '../../mixin/layer-type-util'
import { DataFlowList } from '@mapgis/pan-spatial-map-common'
import * as turf from '@turf/turf'

@Component
export default class RightPopover extends Mixins(layerTypeUtil) {
  @Prop({ type: Object, default: () => ({}) }) layerItem

  listData = [
    {
      name: '图层元数据',
      show: this.isMetaData(this.layerItem),
      click: () => this.metaDataInfo()
    },
    {
      name: '查看属性',
      show: this.isAttributes(this.layerItem),
      click: () => this.attributes()
    },
    {
      name: '自定义查询',
      show: this.isMetaData(this.layerItem) && !this.isDataFlow(this.layerItem),
      click: () => this.customQuery()
    },
    {
      name: '编辑样式',
      show: this.isDataFlow(this.layerItem),
      click: () => this.editDataFlowStyle()
    },
    {
      name: '缩放至',
      show: this.isFitbound(this.layerItem),
      click: () => this.fitBounds()
    },
    {
      name: '切换矩阵集',
      show:
        this.layerItem.layer &&
        this.isWMTSLayer(this.layerItem.layer) &&
        this.isActiveWMTSLayer(this.layerItem),
      click: () => this.resetTilematrixSet()
    },
    {
      name: '切换图层',
      show:
        this.isParentLayer(this.layerItem) && this.isWMTSLayer(this.layerItem),
      click: () => this.openChangeActiveLayer()
    },
    {
      name: '置顶',
      show:
        this.isParentLayer(this.layerItem) && !this.isIGSScene(this.layerItem),
      click: () => this.toTop()
    }
  ]

  metaDataInfo() {
    this.$emit('meta-data-info', this.layerItem)
  }

  attributes() {
    this.$emit('attributes', this.layerItem)
  }

  editDataFlowStyle() {
    this.$emit('edit-data-flow-style', this.layerItem)
  }

  customQuery() {
    this.$emit('custom-query', this.layerItem)
  }

  fitBounds() {
    this.getDataFlowExtent(this.layerItem)
    this.$emit(
      'fit-bounds',
      this.layerItem,
      this.getDataFlowExtent(this.layerItem)
    )
  }

  changeM3DProps() {}

  getDataFlowExtent(layerItem) {
    if (this.isDataFlow(layerItem)) {
      const dataList = DataFlowList.getDataFlowById(layerItem.id)
      const lineArr = dataList.map(item => {
        const {
          geometry: { coordinates }
        } = item
        return coordinates
      })
      const line = turf.lineString(lineArr)
      const [xmin, ymin, xmax, ymax] = turf.bbox(line)
      return {
        xmin,
        ymin,
        xmax,
        ymax
      }
    }

    return undefined
  }

  resetTilematrixSet() {
    this.$emit('reset-tilematrix-set', this.layerItem)
  }

  openChangeActiveLayer() {
    this.$emit('open-change-active-layer', this.layerItem)
  }

  toTop() {
    this.$emit('to-top', this.layerItem)
  }
}
</script>

<style scoped></style>
