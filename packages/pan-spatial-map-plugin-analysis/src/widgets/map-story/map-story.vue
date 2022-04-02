<template>
  <div id="mapStory" class="mp-widget-map-story">
    <mapgis-3d-map-story
      v-if="showMapStory"
      @storyPreview="storyPreview"
      @chapterPreview="chapterPreview"
      @save="save"
      :height="height"
      :width="width"
      :enablePreview="enablePreview"
      :enableClose="enableClose"
      :enableOneMap="enableOneMap"
      :dataSource="dataSource"
    />
    <mp-window-wrapper :visible="showPreview">
      <mp-window
        :visible.sync="showPreview"
        title="地图故事"
        :is-full-screen="false"
        :shrinkAction="false"
        :fullScreenAction="false"
        :horizontal-offset="48"
        :vertical-offset="50"
        :width="340"
        :has-padding="false"
        anchor="top-right"
      >
        <template>
          <mapgis-3d-preview-map-story
            v-show="showPreview"
            :height="previewHeight"
            :width="previewWidth"
            :dataSource="storyDataSource"
            :enableFullScreen="enableFullScreen"
            :enableArrow="enableArrow"
            :enablePlay="enablePlay"
            :enableClose="enableClose"
            ref="preview"
          />
        </template>
      </mp-window>
    </mp-window-wrapper>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { api, dataCatalogManagerInstance } from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpMapStory'
})
export default class MpMapStory extends Mixins(WidgetMixin) {
  private dataSource = [
    {
      title: '时空演变',
      description: '',
      uuid: '100001',
      map: {
        type: 'WMTS',
        baseUrl:
          'http://t4.tianditu.gov.cn/cta_w/wmts?tk=9c157e9585486c02edf817d2ecbc7752',
        layer: 'cta',
        tilingScheme: 'EPSG:3857',
        tileMatrixSet: 'w',
        format: 'tiles',
        vueKey: 'default',
        vueIndex: 1000213213121
      },
      features: [],
      chapters: [
        {
          projectUUID: '100001',
          uuid: '111',
          camera: {
            uuid: '111'
          },
          features: [],
          title: '章节一',
          content: '',
          animationTime: '5000'
        }
      ]
    }
  ]

  private width = 248

  private height = 0

  private previewHeight = 770

  private previewWidth = 334

  private showPreview = false

  private showMapStory = false

  private enableFullScreen = false

  private enableArrow = false

  private enablePlay = false

  private enableClose = false

  private enablePreview = false

  private enableOneMap = true

  private storyDataSource = {}

  private maps = []

  async mounted() {
    const canvas = document.getElementsByClassName('mapboxgl-canvas')
    this.height = canvas[0].offsetHeight - 66
    let config = await api.getWidgetConfig('map-story')
    if (!config) {
      config = {
        dataSource: []
      }
    }
    const { dataSource } = config
    if (dataSource) {
      this.dataSource = dataSource
    }
    // 获取地图数据
    // const dataCatalogTreeData = await dataCatalogManagerInstance.getDataCatalogTreeData()
    // this.maps = this.getMap(dataCatalogTreeData)
  }

  getMap(dataCatalogTreeData) {
    let maps = []
    for (let i = 0; i < dataCatalogTreeData.length; i++) {
      const { serverType, children } = dataCatalogTreeData[i]
      if (serverType) {
        switch (serverType) {
          case 7:
            // WMTS
            // map = {
            //   type: "WMTS",
            //   baseUrl: dataCatalogTreeData[i].serverURL,
            //   layer: dataCatalogTreeData[i].serverName,
            //   tilingScheme: "EPSG:4326",
            //   tileMatrixSet: this.mapCopy.tileMatrixSet,
            // }
            break
          case 10:
            break
          case 8:
            break
          case 5:
            break
          case 4:
            break
          case 11:
            break
          case 6:
            break
          case 28:
            break
          default:
            break
        }
        maps.push(dataCatalogTreeData[i].description)
      }
      if (children && children.length > 0) {
        maps = maps.concat(this.getMap(children))
      }
    }
    return maps
  }

  async save(e) {
    let config = await api.getWidgetConfig('map-story')
    if (!config) {
      config = {}
    }
    config.dataSource = e
    api.saveWidgetConfig({
      name: 'map-story',
      config: config
    })
  }

  onOpen() {
    this.showMapStory = true
  }

  chapterPreview(dataSource) {
    this.storyDataSource = dataSource
    this.showPreview = true
    this.enableArrow = false
    this.enablePlay = false
  }

  storyPreview(dataSource) {
    this.storyDataSource = dataSource
    this.showPreview = true
    this.enableArrow = true
    this.enablePlay = true
    this.$refs.preview.projectPreview()
  }
}
</script>

<style scoped>
.mp-widget-map-story {
  position: absolute;
  top: -4px;
  left: -4px;
}

.cesium-popup-close-button {
  margin-top: 7px;
  margin-right: 6px;
  font-size: 32px !important;
}
</style>
