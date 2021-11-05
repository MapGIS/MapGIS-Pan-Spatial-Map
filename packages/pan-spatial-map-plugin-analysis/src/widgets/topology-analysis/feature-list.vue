<template>
  <a-spin :spinning="loading">
    <div class="feature-list-container">
      <a-list item-layout="horizontal" :data-source="list" size="small">
        <a-list-item
          slot="renderItem"
          slot-scope="item"
          style="padding-left:15px"
        >
          <a-radio
            @click="selectFeature(item)"
            :checked="selectItem && selectItem.FID === item.FID"
          >
            {{ item.FID }}
          </a-radio>
        </a-list-item>
      </a-list>
      <div v-if="list.length > 0" class="feature-list-pagination-container">
        <a-pagination
          size="small"
          showLessItems
          :total="totalCount"
          :current="page"
          @change="changePage"
        />
      </div>
    </div>
  </a-spin>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { LayerType, WidgetMixin, Feature } from '@mapgis/web-app-framework'

@Component
export default class FeatureList extends Vue {
  @Prop() params: Record<string, unknown>

  @Prop() active: boolean

  @Prop() type: string

  loading = false

  list = []

  selectItem = null

  totalCount = 0

  page = 1

  @Watch('active', { deep: true, immediate: true })
  activeChange() {
    if (!this.active) {
      this.selectFeature(null)
    }
  }

  @Watch('params', { deep: true, immediate: true })
  paramsChange() {
    this.totalCount = 0
    this.page = 1
    this.query()
  }

  changePage(page) {
    this.page = page
    this.query()
  }

  async query() {
    this.list = []
    if (!this.params) {
      return
    }
    this.loading = true
    try {
      const {
        id,
        name,
        ip,
        port,
        serverType,
        layerIndex,
        serverName,
        serverUrl,
        geometry,
        gdbp
      } = this.params
      if (serverType === LayerType.IGSMapImage) {
        const options = {
          f: 'json',
          ip,
          port,
          geometry,
          page: this.page - 1,
          pageCount: 10,
          docName: serverName,
          layerIdxs: layerIndex,
          coordPrecision: 8
        }
        const res = await Feature.FeatureQuery.query(options, true)
        this.dealWithResult(res)
      } else if (serverType === LayerType.IGSVector) {
        const options = {
          f: 'json',
          ip,
          port,
          geometry,
          page: this.page - 1,
          pageCount: 10,
          gdbp,
          coordPrecision: 8
        }
        const res = await Feature.FeatureQuery.query(options, true)
        this.dealWithResult(res)
      }
    } catch (error) {
    } finally {
      this.loading = false
    }
  }

  dealWithResult(res) {
    if (res) {
      let results
      if (Array.isArray(res)) {
        results = res
      } else {
        results = [res]
      }
      const { SFEleArray, TotalCount } = results[0]

      this.list = SFEleArray || []
      this.totalCount = TotalCount || 0
    }
  }

  selectFeature(val) {
    this.selectItem = val
    if (val) {
      let FeatureCollection
      let dots
      const dotsArr = []
      switch (val.ftype) {
        case 1:
          dots = val.fGeom.PntGeom[0].Dot
          // eslint-disable-next-line no-case-declarations
          const lngLat = [dots.x, dots.y]
          // dotsArr.push([dots.x, dots.y])
          FeatureCollection = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {
                  center: lngLat,
                  fGeom: val.fGeom,
                  ftype: val.ftype
                },
                geometry: {
                  type: 'Point',
                  coordinates: lngLat
                }
              }
            ]
          }
          break
        case 2:
          dots = val.fGeom.LinGeom[0].Line.Arcs[0].Dots
          for (let i = 0; i < dots.length; i++) {
            dotsArr.push([dots[i].x, dots[i].y])
          }
          FeatureCollection = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {
                  bound: [
                    [val.bound.xmin, val.bound.ymin],
                    [val.bound.xmax, val.bound.ymax]
                  ],
                  fGeom: val.fGeom,
                  ftype: val.ftype
                },
                geometry: {
                  type: 'LineString',
                  coordinates: dotsArr
                }
              }
            ]
          }
          break
        case 3:
          dots = val.fGeom.RegGeom[0].Rings[0].Arcs[0].Dots
          for (let i = 0; i < dots.length; i++) {
            dotsArr.push([dots[i].x, dots[i].y])
          }
          FeatureCollection = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {
                  bound: [
                    [val.bound.xmin, val.bound.ymin],
                    [val.bound.xmax, val.bound.ymax]
                  ],
                  fGeom: val.fGeom,
                  ftype: val.ftype
                },
                geometry: {
                  type: 'Polygon',
                  coordinates: [dotsArr]
                }
              }
            ]
          }
          break
        default:
          break
      }
      this.$emit('select-item', FeatureCollection)
    } else {
      this.$emit('select-item', null)
    }
  }
}
</script>

<style lang="less">
.feature-list-container {
  width: 230px;
  height: 180px;
  display: flex;
  flex-direction: column;
  .ant-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .feature-list-pagination-container {
    padding: 5px 10px;
    text-align: right;
    border-top: 1px solid @border-color;
  }
}
</style>
