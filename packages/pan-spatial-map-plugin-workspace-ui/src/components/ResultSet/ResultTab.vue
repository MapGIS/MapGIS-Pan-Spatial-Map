<template>
  <div class="result-tab-container column fit">
    <q-tabs
      align="left"
      v-model="tab"
      narrow-indicator
      class="col-auto full-width"
      dense
    >
      <q-tab
        v-for="{ id, label } in tables"
        :key="id"
        :name="id"
        :label="label"
      />
    </q-tabs>

    <q-tab-panels
      animated
      v-model="tab"
      keep-alive
      class="col bg-container text-container full-width"
    >
      <q-tab-panel
        v-for="{ id } in tables"
        :key="id"
        :name="id"
        class="q-pa-none"
      >
        <div class="fit">
          <q-table
            :data="tableData"
            :columns="tableColumns"
            :pagination.sync="pagination"
            :loading="loading"
            :visible-columns="visibleColumns"
            :row-key="getRowKey"
            selection="single"
            :selected.sync="selection"
            @request="request"
            @row-click="rowClick"
            @row-dblclick="rowDblclick"
            class="full-height q-pb-md"
            loading-label="正在加载..."
            no-data-label="没有数据"
            dense
          >
            <template v-slot:top="props">
              <div
                class="q-gutter-sm flex full-width"
                style="background: #eee;padding: 2px 0 2px 4px;"
              >
                <q-btn
                  dense
                  flat
                  label="按地图范围过滤"
                  @click="filterWithMap = !filterWithMap"
                  :class="{ 'text-primary': filterWithMap }"
                />
                <q-btn
                  dense
                  flat
                  label="清除所有"
                  icon="clear"
                  @click="clear"
                />
                <slot />
                <q-space />
                <q-btn
                  dense
                  flat
                  round
                  :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                  @click="props.toggleFullscreen"
                  class="q-ml-md"
                />
              </div>
            </template>
          </q-table>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <result-tab-mapbox
      v-if="isPlaneMode"
      :markers="markers"
      :filterWithMap="filterWithMap"
      :bounds="bounds"
      :geojson="geojson"
      @mapBounds="getGeometry"
      @clear="clear"
    ></result-tab-mapbox>
    <result-tab-cesium
      v-else
      :markers="markers"
      :filterWithMap="filterWithMap"
      :bounds="bounds"
      :geojson="geojson"
      @mapBounds="getGeometry"
      @clear="clear"
    ></result-tab-cesium>
  </div>
</template>

<script lang="ts">
import { Notify } from 'quasar'
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { UUID } from '@mapgis/webclient-store/src/utils'
import {
  utilInstance,
  queryFeaturesInstance,
  ResultSetColumnOper,
  ResultSetCategoryOper,
  FeatureIGS,
  FeatureGeoJSON,
  GFeature,
  MapTypeChanageMixin
} from '@mapgis/pan-spatial-map-store'
import markerBlue from '../../assets/images/markerBlue.png'
import ResultTabMapbox from './ResultTabMapbox.vue'
import ResultTabCesium from './ResultTabCesium.vue'

declare const Zondy: any

interface Pagination {
  // 排序字段
  sortBy?: string
  // 是否是逆序
  descending?: boolean
  // 页码
  page: number
  // 每页的数量
  rowsPerPage: number
  // 总数
  rowsNumber: number
}

@Component({
  name: 'MpResultTab',
  components: { ResultTabMapbox, ResultTabCesium }
})
export default class MpResultTab extends Mixins(MapTypeChanageMixin) {
  // 结果集分类信息
  @Prop(Object) data!: ResultSetCategoryOper

  // 所有表格信息
  private get tables() {
    return this.data.tables || []
  }

  // 当前激活的表格
  private tab = ''

  // 表格数据
  private tableData: unknown[] = []

  // 表头数据
  private tableColumns: ResultSetColumnOper[] = []

  // 分页信息
  private pagination: Pagination = {
    page: 1,
    rowsPerPage: 20,
    rowsNumber: 0
  }

  private markerBlue = markerBlue

  private markers: Record<string, any>[] = []

  private bounds: Record<string, any> = {}

  private geojson: Record<string, any> = {}

  // 是否正在加载
  private loading = false

  private activated() {
    this.tab = this.tables[0].id
  }

  // 显示的表头字段
  private get visibleColumns() {
    return this.tableColumns.filter(x => x.visible).map(x => x.name)
  }

  // 获取行的唯一标识
  private getRowKey: (row: unknown) => unknown = () => ''

  // 选中的行
  private selection: unknown[] = []

  // 数据请求
  private request(requestProp: any) {
    this.pagination = requestProp.pagination
    this.query()
  }

  // 单击行
  private rowClick(event: Event, row: unknown) {
    this.geojson = {
      features: [row],
      type: 'FeatureCollection'
    }
    this.selection = [row]
  }

  // 双击行
  private rowDblclick(event: Event, row: unknown) {
    const feature = row as GFeature
    let { bound } = feature
    if (bound === undefined) {
      bound = utilInstance.getGeoJsonFeatureBound(feature)
    }
    this.bounds = { ...(bound as Record<string, number>) }
  }

  // 是否随地图范围过滤
  private filterWithMap = false

  // 地图范围
  private geometry?: Record<string, unknown> = undefined

  async getGeometry(val: Record<string, any>) {
    const { xmin, ymin, xmax, ymax } = val
    this.geometry = new Zondy.Object.Rectangle(xmin, ymin, xmax, ymax)
    // 分页初始化到第一页
    this.pagination.page = 1
    // 记录当前选中的行（避免双击定位同时根据范围过滤时导致信息刷新）
    const [row] = this.selection
    await this.query()
    if (row) {
      // 如果有选中行则在表格刷新之后再次选中行
      const feature = this.tableData.find(feature => {
        const { properties } = feature as GFeature
        const {
          properties: { fid }
        } = row as GFeature
        return properties.fid === fid
      })
      this.selection = [feature]
      this.geojson = {
        features: [feature],
        type: 'FeatureCollection'
      }
    }
  }

  @Watch('tab')
  private changeTab() {
    this.tableData = []
    this.tableColumns = []
    this.query()
  }

  private async query() {
    this.loading = true
    try {
      this.clear()
      await this.queryGeoJson(this.filterWithMap ? this.geometry : undefined)
      this.$emit('open')
    } catch (error) {
      const e = error as Error
      console.warn('[DEBUG]: ResultTab -> query -> e.stack', e.stack)
      Notify.create({
        timeout: 2000,
        message: e.message
      })
    }
    this.loading = false
  }

  private async queryGeoJson(geo: Record<string, unknown> | undefined) {
    const table = this.tables.find(x => x.id === this.tab)
    if (!table) throw new Error('获取表格数据失败')
    const { ip, port, docName } = this.data
    const { layerIndex, gdbp, where, geometry } = table
    const { page, rowsPerPage } = this.pagination
    const tangram = geo || geometry
    const geojson = (await queryFeaturesInstance.query({
      ip,
      port: port.toString(),
      f: 'geojson',
      where,
      geometry: tangram,
      page: page - 1,
      pageCount: rowsPerPage,
      gdbp,
      docName,
      layerIdxs: layerIndex
    })) as FeatureGeoJSON
    const { AttStruct, TotalCount } = await this.queryCount(tangram)
    const columns: ResultSetColumnOper[] = []
    const {
      FldNumber = 0,
      FldName = [],
      FldAlias = [],
      FldType = []
    } = AttStruct
    for (let index = 0; index < FldNumber; index++) {
      const name = FldName[index]
      const alias = FldAlias[index] || name
      const type = FldType[index]
      columns.push(
        new ResultSetColumnOper({
          name,
          label: `${name}(${alias})`,
          field(row: GFeature) {
            return row.properties[name]
          },
          type,
          visible: true
        })
      )
      this.tableColumns = columns
      this.getRowKey = row => (row as GFeature).properties.fid
      this.pagination.rowsNumber = TotalCount
      this.tableData = geojson.features
      this.markers = []
      const tempMarkers: Record<string, any>[] = []
      for (let i = 0; i < geojson.features.length; i += 1) {
        const feature = geojson.features[i]
        const center = utilInstance.getGeoJsonFeatureCenter(feature)
        const marker: Record<string, any> = {
          coordinates: center,
          fid: feature.properties.fid,
          img: this.markerBlue,
          id: UUID.uuid(),
          properties: feature.properties
        }
        tempMarkers.push(marker)
      }
      this.markers = [...tempMarkers]
    }
  }

  private async queryCount(geometry?: Record<string, any>) {
    const table = this.tables.find(x => x.id === this.tab)
    if (!table) throw new Error('获取表格数据失败')
    const { ip, port, docName } = this.data
    const { layerIndex, gdbp, where } = table
    const featureSet = (await queryFeaturesInstance.query({
      ip,
      port: port.toString(),
      f: 'json',
      cursorType: 'cursorType',
      IncludeAttribute: false,
      IncludeGeometry: false,
      IncludeWebGraphic: false,
      geometry,
      where,
      gdbp,
      docName,
      layerIdxs: layerIndex
    })) as FeatureIGS
    return featureSet
  }

  private clear() {
    this.geojson = {
      features: [],
      type: 'FeatureCollection'
    }
    this.markers = []
    this.selection = []
  }
}
</script>
<style lang="scss">
.q-table--dense .q-table__top {
  padding: 0;
  border-bottom: 1px solid #b5bcc7;
}
</style>
