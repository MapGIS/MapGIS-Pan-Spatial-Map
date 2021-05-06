<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { queryIgsServicesInfoInstance } from '@mapgis/pan-spatial-map-store'
import { uuid } from '@mapgis/webclient-store/src/utils/uuid'

const MapGISLocal = 'MapGISLocal'
const MapGISLocalPlus = 'MapGISLocalPlus'

/**
 * MapGIS图层选择组件
 * @vue-prop        {String}    ip              服务器地址
 * @vue-prop        {String}    port            服务器端口
 * @vue-data        {Array}     treeData        树节点数据
 * @vue-event       {String}    update:gdbp     更新gdbp地址
 */
@Component({
  name: 'MapgisLayer',
  components: {}
})
export default class MapgisLayer extends Vue {}
</script>

<style lang="scss" scoped></style>
