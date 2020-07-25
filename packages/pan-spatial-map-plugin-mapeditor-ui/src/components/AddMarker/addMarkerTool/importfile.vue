<template>
  <div class="import-file-wrapper">
    <div class="col-auto row items-center top-02em">
      <label class="col-3 text-right">文件路径：</label>
      <q-input
        class="col-9"
        @input="readImportFile"
        dense
        outlined
        type="file"
        accept=".txt"
        :loading="importLoading"
      />
    </div>
    <div>
      <q-btn
        flat
        style="float:right"
        color="primary"
        label="查看支持导入文件的数据结构"
        @click="showImportFileDesc"
      ></q-btn>
    </div>
    <div class="col-auto items-center group-title top-05em">
      <q-checkbox v-model="useTransform" label="设置输入坐标空间参考系" />
    </div>
    <div class="col-auto row items-center" v-show="useTransform">
      <label class="col-3 text-right">参考系：</label>
      <q-select
        class="col-9 top-02em"
        dense
        outlined
        v-model="crsName"
        :options="crsNames"
      />
    </div>
    <div class="group-btn-div">
      <q-btn color="primary" class="group-btn" @click="importSure">确定</q-btn>
    </div>

    <mp-widget-panel
      :offset="[320, 0]"
      title="导入文件数据结构"
      :visible.sync="openImportFileDesc"
    >
      <import-file-desc />
    </mp-widget-panel>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Emit } from 'vue-property-decorator'
import { UUID } from '@mapgis/webclient-store/src/utils'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import AddMarkerMixin from '../AddMarkerMixin'
import ImportFileDesc from './ImportFileDesc.vue'

@Component({
  components: { ImportFileDesc }
})
export default class ImportFile extends Mixins(AddMarkerMixin) {
  @Emit('importMarkers')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitTodo(markers: any) {}

  private fileType = '点'

  private fileTypes = ['点', '线', '面', '组合区', '带洞区']

  private crsName = 'WGS1984_度'

  private crsNames = ['WGS1984_度', 'Web墨卡托_WGS1984']

  private importMarkers: any[] = []

  private importLoading = false

  private openImportFileDesc = false

  private useTransform = true

  showImportFileDesc() {
    this.openImportFileDesc = true
  }

  readImportFile(val: any) {
    this.importLoading = true
    const file = val[0]
    const reader = new FileReader()
    // 文件内容载入完毕之后的回调。
    reader.onload = this.fileLoad.bind(this)
    reader.readAsText(file)
  }

  async fileLoad(e: any) {
    // console.log(e.target.result);
    await this.analyzeFile(e.target.result)
    this.importLoading = false
  }

  async analyzeFile(str: string) {
    this.importMarkers = []
    const lines: string[] = str.split('\n')

    for (let i = 0; i < lines.length; i += 4) {
      // 每四行一个标注
      const line0: string = lines[i * 4 + 0]
      const title = line0.split(':')[1]

      const line1: string = lines[i * 4 + 1]
      const description = line1.split(':')[1]

      const line2 = lines[i * 4 + 2]
      const featureType = line2.split(':')[1]

      const line3 = lines[i * 4 + 3]
      const coordsStr = line3.split(':')[1]
      let featuresCoord = [coordsStr]
      if (coordsStr.includes('#')) {
        featuresCoord = coordsStr.split('#')
      }

      const obj: Record<string, any> = {
        id: UUID.uuid(),
        title,
        description,
        features: [],
        coordinates: []
      }

      let feature: Record<string, any> = {}

      if (featureType.includes('区')) {
        const polygonCoords: any[] = []
        for (let j = 0; j < featuresCoord.length; j += 1) {
          const polygonCoordsStr = featuresCoord[j]
          const arcStrs = polygonCoordsStr.split(' ')
          const arcCoordinates: any[] = []
          for (let a = 0; a < arcStrs.length; a += 1) {
            const arcCoordStr = arcStrs[a]
            const arcCoordStrs = arcCoordStr.split(',')
            const arcCoord = [Number(arcCoordStrs[0]), Number(arcCoordStrs[1])]
            arcCoordinates.push(arcCoord)
          }
          let arcCoords = arcCoordinates
          if (this.useTransform) {
            // eslint-disable-next-line no-await-in-loop
            arcCoords = await this.transPoints(arcCoordinates, this.crsName)
          }
          polygonCoords.push(arcCoords)
        }

        feature = {
          geometry: {
            coordinates: polygonCoords,
            type: 'Polygon'
          },
          id: UUID.uuid(),
          properties: {},
          type: 'Feature'
        }
        const coordinates = utilInstance.getGeoJsonFeatureCenter(feature)
        obj.features.push(feature)
        obj.coordinates = coordinates
      } else if (featureType.includes('点') || featureType.includes('线')) {
        for (let j = 0; j < featuresCoord.length; j += 1) {
          const coordStr = featuresCoord[j]
          if (featureType.includes('点')) {
            const pointCoordStrs = coordStr.split(',')
            const pointCoordinates = [
              Number(pointCoordStrs[0]),
              Number(pointCoordStrs[1])
            ]
            let pointCoords = [pointCoordinates]
            if (this.useTransform) {
              // eslint-disable-next-line no-await-in-loop
              pointCoords = await this.transPoints(
                [pointCoordinates],
                this.crsName
              )
            }
            feature = {
              geometry: {
                coordinates: pointCoords[0],
                type: 'Point'
              },
              id: UUID.uuid(),
              properties: {},
              type: 'Feature'
            }
          } else if (featureType.includes('线')) {
            const lineStrs = coordStr.split(' ')
            const lineCoordinates: any[] = []
            for (let l = 0; l < lineStrs.length; l += 1) {
              const lineCoordStr = lineStrs[l]
              const lineCoordStrs = lineCoordStr.split(',')
              const lineCoord = [
                Number(lineCoordStrs[0]),
                Number(lineCoordStrs[1])
              ]
              lineCoordinates.push(lineCoord)
            }
            let lineCoords = lineCoordinates
            if (this.useTransform) {
              // eslint-disable-next-line no-await-in-loop
              lineCoords = await this.transPoints(lineCoordinates, this.crsName)
            }
            feature = {
              geometry: {
                coordinates: lineCoords,
                type: 'LineString'
              },
              id: UUID.uuid(),
              properties: {},
              type: 'Feature'
            }
          }
          const coordinates = utilInstance.getGeoJsonFeatureCenter(feature)
          obj.features.push(feature)
          obj.coordinates = coordinates
        }
      }
      this.importMarkers.push(obj)
    }
  }

  importSure() {
    this.emitTodo(this.importMarkers)
  }

  inputCancel() {}
}
</script>

<style scoped>
.import-file-wrapper {
  min-width: 22em;
}

.group-title {
  border-bottom: 1px solid black;
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

.top-05em {
  margin-top: 0.5em;
}
</style>
