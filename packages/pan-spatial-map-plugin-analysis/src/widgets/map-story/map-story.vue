<template>
  <div id='mapStory' class='mp-widget-map-story'>
    <mapgis-3d-map-story-layer
      v-if='showMapStory'
      @projectPreview='projectPreview'
      @featurePreview='featurePreview'
      @save='save'
      :height='height'
      :width='width'
      :enableClose='enableClose'
      :dataSource='dataSource' />
    <mp-window-wrapper :visible='showPreview'>
      <mp-window
        :visible.sync='showPreview'
        title='地图故事'
        :is-full-screen='false'
        :shrinkAction='false'
        :fullScreenAction='false'
        :horizontal-offset='48'
        :vertical-offset='50'
        :width='340'
        :has-padding='false'
        anchor='top-right'
      >
        <template>
          <mapgis-3d-preview-map-story-layer
            v-show='showPreview'
            :height='previewHeight'
            :width='previewWidth'
            :dataSource='storyDataSource'
            :enableFullScreen='enableFullScreen'
            :enableArrow='enableArrow'
            :enablePlay='enablePlay'
            ref='preview'
          />
        </template>
      </mp-window>
    </mp-window-wrapper>
  </div>
</template>

<script lang='ts'>
import { Mixins, Component } from 'vue-property-decorator'
import {
  WidgetMixin
} from '@mapgis/web-app-framework'
import { api } from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpMapStory'
})
export default class MpMapStory extends Mixins(WidgetMixin) {
  private dataSource = [{
    'title': '时空演变',
    'description': '',
    'uuid': '100001',
    'map': {
      'type': 'WMTS',
      'baseUrl': 'http://t4.tianditu.gov.cn/cta_w/wmts?tk=9c157e9585486c02edf817d2ecbc7752',
      'layer': 'cta',
      'tilingScheme': 'EPSG:3857',
      'tileMatrixSet': 'w',
      'format': 'tiles',
      'vueKey': 'default',
      'vueIndex': 1000213213121
    },
    'features': [],
    'chapters': [{
      'projectUUID': '100001',
      'uuid': '111',
      'camera': {
        'uuid': '111'
      },
      'features': [],
      'title': '章节一',
      'content': '',
      'animationTime': '5000'
    }]
  }]

  private width = 263

  private height = 0

  private previewHeight = 770

  private previewWidth = 334

  private showPreview = false

  private showMapStory = false

  private enableFullScreen = false

  private enableArrow = false

  private enablePlay = false

  private enableClose = false

  private storyDataSource = {}

  async mounted() {
    const canvas = document.getElementsByClassName('mapboxgl-canvas')
    this.height = canvas[0].offsetHeight - 57
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

  featurePreview(features) {
    this.showPreview = true
    this.enableArrow = false
    this.enablePlay = false
    this.storyDataSource = {
      chapters: features
    }
  }

  projectPreview(dataSource, enableFullScreen) {
    this.storyDataSource = dataSource
    this.showPreview = true
    this.enableArrow = true
    this.enablePlay = true
    this.enableFullScreen = enableFullScreen
    this.$refs.preview.projectPreview()
  }
}
</script>

<style>
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
