<template>
  <div class="marker-manager-wrapper">
    <div>
      <q-btn
        v-for="(item, i) in buttons"
        :key="'add-marker-btn' + i"
        flat
        :color="item.type"
        @click="item.click"
      >
        <q-icon :name="item.icon" />
        <q-tooltip>{{ item.tip }}</q-tooltip>
      </q-btn>
    </div>
    <div>
      <q-table
        :data="markers"
        :columns="getTableColumns(markers)"
        row-key="id"
        selection="multiple"
        :selected.sync="markerSelected"
      ></q-table>
    </div>
    <mp-widget-panel
      :offset="[320, 0]"
      :width="300"
      :height="120"
      title="添加标注"
      :visible.sync="showAddMarker"
    >
      <add-marker @addMarkers="updateMarkers"></add-marker>
    </mp-widget-panel>

    <mp-widget-panel
      :offset="[320, 0]"
      :width="300"
      :height="120"
      title="导出坐标"
      :visible.sync="showExportFile"
    >
      <export-file :markers="markers"></export-file>
    </mp-widget-panel>
    <mapbox-show-markers
      v-if="isPlaneMode"
      :markers="markers"
    ></mapbox-show-markers>
    <cesium-show-markers v-else :markers="markers"></cesium-show-markers>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
// import { MapboxMarker, MapboxPopup } from '@mapgis/webclient-vue-mapboxgl'
import {
  mdiTagPlus,
  mdiDelete,
  mdiContentSave,
  mdiFileExport
} from '@quasar/extras/mdi-v4'
import { MapTypeChanageMixin } from '@mapgis/pan-spatial-map-store'
import AddMarker from './AddMarker.vue'
import ExportFile from './addMarkerTool/ExportFile.vue'
import MapboxShowMarkers from './mapboxMarker/MapboxShowMarkers.vue'
import CesiumShowMarkers from './cesiumMarker/CesiumShowMarkers.vue'

@Component({
  name: 'MpMarkerManager',
  components: {
    AddMarker,
    ExportFile,
    MapboxShowMarkers,
    CesiumShowMarkers
  }
})
export default class MpMarkerManager extends Mixins(MapTypeChanageMixin) {
  private buttons = [
    {
      icon: mdiTagPlus,
      type: 'primary',
      tip: '添加标注',
      click: this.addMarkers.bind(this)
    },
    {
      icon: mdiFileExport,
      type: 'primary',
      tip: '导出坐标',
      click: this.exportCoords.bind(this)
    },
    {
      icon: mdiContentSave,
      type: 'primary',
      tip: '保存',
      click: this.toggleSave.bind(this)
    },
    {
      icon: mdiDelete,
      type: 'primary',
      tip: '删除',
      click: this.toggleDelete.bind(this)
    }
  ]

  private showAddMarker = false

  private showExportFile = false

  private markers: any[] = []

  private markerSelected: string[] = []

  addMarkers() {
    this.showAddMarker = true
  }

  updateMarkers(markers: any[]) {
    this.markers = [...this.markers, ...markers]
  }

  toggleDelete() {
    for (let i = 0; i < this.markerSelected.length; i += 1) {
      const selectedmarker = this.markerSelected[i]
      const index = this.markers.indexOf(selectedmarker)
      this.markers.splice(index, 1)
    }
  }

  toggleSave() {}

  exportCoords() {
    this.showExportFile = true
  }

  getTableColumns() {
    const columns = [
      {
        name: 'title',
        align: 'center',
        label: '标注名称',
        field: 'title',
        sortable: true
      },
      {
        name: 'description',
        align: 'center',
        label: '标注描述',
        field: 'description',
        sortable: true
      }
    ]
    return columns
  }
}
</script>

<style>
.marker-manager-wrapper {
  margin: 1em;
  max-height: 45em;
  overflow: auto;
}

.group-btn-div {
  width: 100%;
  text-align: center;
  margin-top: 0.5em;
}

.group-btn {
  min-width: 3em;
  margin-right: 0.5em;
}

.top-02em {
  margin-top: 0.2em;
}

.min-width-10em {
  min-width: 10em;
}
</style>
