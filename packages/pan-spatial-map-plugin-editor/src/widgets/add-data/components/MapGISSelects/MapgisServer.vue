<template>
  <div class="mapgis-server"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { queryIgsServicesInfoInstance } from '@mapgis/pan-spatial-map-store'

/**
 * MapGIS地图服务选择组件
 * @vue-prop        {String}    ip              服务器地址
 * @vue-prop        {String}    port            服务器端口
 * @vue-prop        {String}    type            服务类型
 * @vue-data        {Array}     treeData        树节点数据
 */
@Component({
  name: 'MapgisServer',
  components: {}
})
export default class MapgisServer extends Vue {}
</script>

<style lang="scss" scoped></style>
