<template>
  <div class="import-file-wrapper">
    <div class="col-auto row items-center">
      <label class="col-3 text-right">文件名称：</label>
      <q-input class="col-9 q-my-xs" dense outlined v-model="exportFileName" />
      <label class="col-3 text-right">导出格式：</label>
      <q-select
        class="col-9"
        dense
        outlined
        v-model="exportFileType"
        :options="exportFileTypes"
      />
    </div>
    <div class="group-btn-div">
      <q-btn color="primary" class="group-btn" @click="exportSure">确定 </q-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import axios from 'axios'
import {
  systemConfigInstance,
  ExportMarkersToFileInstance
} from '@mapgis/pan-spatial-map-store'
import addMarkerJson from '../addMarker.json'

@Component({ components: {} })
export default class ExportFile extends Vue {
  @Prop({ type: Array, required: true })
  readonly markers!: Array<Record<string, any>>

  private addMarkerConfig = addMarkerJson

  private defaultConfig = systemConfigInstance.config

  private exportFileName = ''

  private exportFileType = 'shp格式'

  private exportFileTypes = ['shp格式', '6x格式', 'excel格式']

  private shpOr6xOption: any

  exportSure() {
    if (this.exportFileName) {
      switch (this.exportFileType) {
        case 'shp格式':
          this.ouputToShpOr6x(this.exportFileName, 'shp')
          break
        case '6x格式':
          this.ouputToShpOr6x(this.exportFileName, '6x')
          break
        case 'excel格式':
          this.ouputToExcel(this.exportFileName)
          break
        default:
          break
      }
    }
  }

  // 发送请求创建简单要素类 --> 发送请求将简单要素类保存
  creatFeature(flieName: string, featureSet: any, featureType: string) {
    const { projectionName } = this.defaultConfig // 获取目标参考系
    const { userName, passWord } = this.addMarkerConfig
    const getFeatureUrl = `http://${this.defaultConfig.ip}:${this.defaultConfig.port}/onemap/featureSet/export?path=${flieName}&srsName=${projectionName}&type=${featureType}&f=json&user=${userName}&password=${passWord}`
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    const { shpOr6xOption } = this
    axios.post(getFeatureUrl, JSON.stringify(featureSet)).then(
      res => {
        const { data } = res
        let result = data
        if (data.indexOf('"') > -1) {
          result = data.replaceAll('"', '')
        }
        const url = `http://${this.defaultConfig.ip}:9999/open/download?path=${result}&user=${userName}&password=${passWord}`

        // eslint-disable-next-line no-restricted-globals
        location.href = url // 下载文件至本地

        setTimeout(() => {
          if (
            shpOr6xOption.featureType === '点' &&
            shpOr6xOption.setOption.featureSet2.SFEleArray.length > 0
          ) {
            // 有线要素
            const flieNameItem =
              shpOr6xOption.fileType === 'shp'
                ? `${shpOr6xOption.flieName}_线.shp`
                : `${shpOr6xOption.flieName}_线.wl`
            shpOr6xOption.featureType = '线'
            self.creatFeature(
              flieNameItem,
              shpOr6xOption.setOption.featureSet2,
              'Lin'
            )
          }
          if (
            shpOr6xOption.featureType === '线' &&
            shpOr6xOption.setOption.featureSet3.SFEleArray.length > 0
          ) {
            // 有区要素
            const flieNameItem =
              shpOr6xOption.fileType === 'shp'
                ? `${shpOr6xOption.flieName}_区.shp`
                : `${shpOr6xOption.flieName}_区.wp`
            shpOr6xOption.featureType = '区'
            setTimeout(() => {
              self.creatFeature(
                flieNameItem,
                shpOr6xOption.setOption.featureSet3,
                'Reg'
              )
            }, 500)
          }
        }, 500)
      },
      error => {
        console.log(error)
      }
    )
  }

  ouputToShpOr6x(flieName: string, fileType: string) {
    const setOption = ExportMarkersToFileInstance.getSetByMarkers(this.markers) // 获取结果集对象
    let flieNameItem: string
    if (setOption.featureSet1.SFEleArray.length > 0) {
      // 有点要素
      this.shpOr6xOption = {
        setOption,
        featureType: '点',
        flieName,
        fileType
      }
      flieNameItem =
        fileType === 'shp' ? `${flieName}_点.shp` : `${flieName}_点.wt`
      this.creatFeature(flieNameItem, setOption.featureSet1, 'Pnt')
    } else if (
      setOption.featureSet2.SFEleArray.length > 0 &&
      setOption.featureSet1.SFEleArray.length === 0
    ) {
      // 无点要素
      this.shpOr6xOption = {
        setOption,
        featureType: '线',
        flieName,
        fileType
      }
      flieNameItem =
        fileType === 'shp' ? `${flieName}_线.shp` : `${flieName}_线.wl`
      this.creatFeature(flieNameItem, setOption.featureSet2, 'Lin')
    } else {
      // 无 点线
      this.shpOr6xOption = {
        setOption,
        featureType: '区',
        flieName,
        fileType
      }
      flieNameItem =
        fileType === 'shp' ? `${flieName}_区.shp` : `${flieName}_区.wp`
      this.creatFeature(flieNameItem, setOption.featureSet3, 'Reg')
    }
  }

  /**
   * 导出excel格式
   */
  ouputToExcel(flieName: string) {
    const managerBaseUrl = ''
    const url = `${managerBaseUrl}WebService/ExportToExcel`
    const record: Array<Record<string, any>> = []
    for (let i = 0; i < this.markers.length; i += 1) {
      let coord = ''
      let fileType = '点'
      // 区标注只有一个feature，一个feature里可以有多个面
      if (this.markers[i].features) {
        for (let f = 0; f < this.markers[i].features.length; f += 1) {
          if (f > 0) {
            coord += '#'
          }
          const { geometry } = this.markers[i].features[f]
          const { type, coordinates } = geometry
          fileType = type
          // 要素之间用'#'分隔，坐标之间用' '分隔，xy之间用','分隔
          switch (type) {
            case 'Point':
              coord += coordinates.join(',')
              break
            case 'LineString':
              for (let l = 0; l < coordinates.length; l += 1) {
                if (l > 0) {
                  coord += ' '
                }
                coord += coordinates[l].join(',')
              }
              break
            case 'Polygon':
              for (let p = 0; p < coordinates.length; p += 1) {
                if (p > 0) {
                  coord += '#'
                }
                const arcPoints = coordinates[p]
                for (let a = 0; a < arcPoints.length; a += 1) {
                  if (a > 0) {
                    coord += ' '
                  }
                  coord += arcPoints[a].join(',')
                }
              }
              break
            default:
              break
          }
        }
      } else {
        coord = this.markers[i].coordinates.join(',')
      }
      const opt = {
        标注序号: i + 1,
        标注名称: this.markers[i].title,
        标注类型: fileType,
        备注: this.markers[i].description,
        中心点坐标: this.markers[i].coordinates,
        几何坐标: coord
      }
      record.push(opt)
    }

    axios.post(url, `name=${flieName}&content=${JSON.stringify(record)}`).then(
      res => {
        const { data } = res
        if (!data) {
          return
        }
        const uploadUrl = `${managerBaseUrl}WebService/DownloadTempFile?name=${flieName}&file=${data}&contentType=application/vnd.ms-excel`
        // 本地发送请求将文件下载
        // eslint-disable-next-line no-restricted-globals
        location.href = uploadUrl
      },
      error => {
        console.log(error)
      }
    )
  }
}
</script>

<style scoped>
.import-file-wrapper {
  min-width: 22em;
  margin: 0.5em;
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
</style>
