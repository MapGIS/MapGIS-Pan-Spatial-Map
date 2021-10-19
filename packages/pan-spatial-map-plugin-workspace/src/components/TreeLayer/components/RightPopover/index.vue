<template>
  <a-list :gutter="10">
    <a-list-item v-if="isMetaData(layerItem)" @click="metaDataInfo">
      图层元数据
    </a-list-item>
    <a-list-item v-if="isAttributes(layerItem)" @click="attributes">
      查看属性
    </a-list-item>
    <a-list-item v-if="isAttributes(layerItem)" @click="customQuery">
      自定义查询
    </a-list-item>
    <!-- 要素统改目前只有符号统改，功能较单一且应用性较弱，从产品角度考虑先去除，待后面要素统改（参数<->参数、属性<->参数）需求强烈且明确后再增加
      <a-list-item
        v-if="(isSubLayer(layerItem) && isIgsDocLayer(layerItem)) || isIgsVectorLayer(layerItem)"
        @click="unifyMode"
      >
        要素统改
      </a-list-item> 
    -->
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
    </a-list-item>
  </a-list>
</template>

<script lang="ts">
import { Component, Vue, Mixins, Prop } from 'vue-property-decorator'
import layerTypeUtil from '../../mixin/layer-type-util'

@Component
export default class RightPopover extends Mixins(layerTypeUtil) {
  @Prop({ type: Object, default: () => ({}) }) layerItem

  metaDataInfo() {
    this.$emit('meta-data-info', this.layerItem)
  }

  attributes() {
    this.$emit('attributes', this.layerItem)
  }

  customQuery() {
    this.$emit('custom-query', this.layerItem)
  }

  fitBounds() {
    this.$emit('fit-bounds', this.layerItem)
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
