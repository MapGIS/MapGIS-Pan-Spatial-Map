<template>
  <div class="add-marker-wrapper">
    <q-tabs
      v-model="tab"
      dense
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
      @input="tabInput"
    >
      <q-tab name="interactAddMarker" label="鼠标交互" />
      <q-tab name="inputCoord" label="输入坐标" />
      <q-tab name="importFile" label="导入文件" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="interactAddMarker">
        <q-btn
          v-for="(item, i) in interactBtns"
          :key="'add-marker-interac-btn' + i"
          flat
          :color="item.type"
          @click="item.click"
        >
          <q-icon :name="item.icon" />
          <q-tooltip>{{ item.tip }}</q-tooltip>
        </q-btn>
      </q-tab-panel>

      <q-tab-panel name="inputCoord">
        <input-coord @inputCoord="addInputMarker"></input-coord>
      </q-tab-panel>

      <q-tab-panel name="importFile">
        <import-file @importMarkers="addImportMarkers"></import-file>
      </q-tab-panel>
    </q-tab-panels>
    <mapbox-add-marker
      v-if="isPlaneMode"
      :drawMode="drawMode"
      @addMarkers="updateMarkers"
    ></mapbox-add-marker>
    <cesium-add-marker
      v-else
      :drawMode="drawMode"
      @addMarkers="updateMarkers"
    ></cesium-add-marker>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Emit } from 'vue-property-decorator'
import { MapboxBaseDraw } from '@mapgis/webclient-vue-mapboxgl'
import {
  mdiMapMarker,
  mdiMapMarkerPath,
  mdiChartAreaspline
} from '@quasar/extras/mdi-v4'
import { UUID } from '@mapgis/webclient-store/src/utils'
import { MapTypeChanageMixin } from '@mapgis/pan-spatial-map-store'
import InputCoord from './addMarkerTool/InputCoord.vue'
import ImportFile from './addMarkerTool/Importfile.vue'
import markerBlue from '../../assets/images/markerBlue.png'
import MapboxAddMarker from './mapboxMarker/MapboxAddMarker.vue'
import CesiumAddMarker from './cesiumMarker/CesiumAddMarker.vue'

@Component({
  components: {
    MapboxBaseDraw,
    InputCoord,
    ImportFile,
    MapboxAddMarker,
    CesiumAddMarker
  }
})
export default class AddMarker extends Mixins(MapTypeChanageMixin) {
  @Emit('addMarkers')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitTodo(markers: any) {}

  private markerImgSrc = markerBlue

  private tab = 'interactAddMarker'

  private drawModes = {
    point: 'point',
    line: 'line',
    polygon: 'polygon'
  }

  private mode: string = this.drawModes.point

  private clickCount = 0

  private drawMode: Record<string, any> = {
    mode: this.mode,
    clickCount: this.clickCount
  }

  private interactBtns = [
    {
      icon: mdiMapMarker,
      type: 'primary',
      tip: '点',
      click: this.togglePoint.bind(this)
    },
    {
      icon: mdiMapMarkerPath,
      type: 'primary',
      tip: '线',
      click: this.togglePolyline.bind(this)
    },
    {
      icon: mdiChartAreaspline,
      type: 'primary',
      tip: '面',
      click: this.togglePolygon.bind(this)
    }
  ]

  private markers: any[] = []

  addImportMarkers(importMarkers: any) {
    this.markers = []
    for (let i = 0; i < importMarkers.length; i += 1) {
      const marker = { ...importMarkers[i] }
      marker.img = this.markerImgSrc
      marker.edit = false
      this.markers.push(marker)
    }
    this.emitTodo(this.markers)
  }

  addInputMarker(coord: any) {
    const addFeature = {
      geometry: {
        coordinates: [...coord],
        type: 'Point'
      },
      id: UUID.uuid(),
      properties: {},
      type: 'Feature'
    }

    const addMarker = {
      id: UUID.uuid(),
      title: '',
      description: '',
      img: this.markerImgSrc,
      edit: true,
      features: [addFeature],
      coordinates: [...coord]
    }
    this.markers = []
    this.markers.push(addMarker)
    this.emitTodo(this.markers)
  }

  updateMarkers(markers: any[]) {
    this.markers = [...markers]
    this.emitTodo(this.markers)
  }

  setDrawMode(mode: string) {
    this.mode = mode
    this.clickCount += 1
    this.drawMode = {
      mode: this.mode,
      clickCount: this.clickCount
    }
  }

  togglePoint() {
    this.setDrawMode(this.drawModes.point)
  }

  togglePolyline() {
    this.setDrawMode(this.drawModes.line)
  }

  togglePolygon() {
    this.setDrawMode(this.drawModes.polygon)
  }

  tabInput(val: any) {
    console.log(this.tab)
    console.log(val)
  }
}
</script>

<style scoped>
.add-marker-wrapper {
  margin: 1em;
  max-height: 45em;
  overflow: auto;
}
</style>
