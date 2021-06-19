<template>
  <a-modal
    class="marker-export-wrapper"
    :visible="visible"
    title="导出标注"
    :width="360"
    :mask="false"
    @cancel="onExportCancel"
    @ok="onExportOk"
  >
    <div class="marker-export-body">
      <a-space direction="vertical" style="flex: 1">
        <a-row>
          <label>文件名称</label>
        </a-row>
        <a-row>
          <a-input v-model="exportOptions.exportFileName"> </a-input>
        </a-row>
        <a-row>
          <label>导出格式</label>
        </a-row>
        <a-row>
          <a-select v-model="exportOptions.exportFileType" style="width: 100%;">
            <a-select-option v-for="item in exportFileTypes" :key="item">
              {{ item }}
            </a-select-option>
          </a-select>
        </a-row>
      </a-space>
    </div>
  </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import {
  baseConfigInstance,
  exportMarkersToFileInstance
} from '@mapgis/pan-spatial-map-store'
import axios from 'axios'

@Component({ name: 'MarkerExport' })
export default class MarkerExport extends Vue {
  @Emit('finished')
  emitFinished() {}

  @Prop({ type: Boolean, default: false }) visible

  @Prop({ type: Array, required: true }) readonly markers!: Array<
    Record<string, any>
  >

  // 表单数据
  private exportOptions = {
    exportFileName: '',
    exportFileType: 'shp格式'
  }

  // 导出格式下拉项配置
  private exportFileTypes = ['shp格式', '6x格式', 'excel格式']

  private markerServerConfig = {
    ip: '192.168.21.191',
    port: '6163',
    isHorizontalSet: 'true',
    userName: 'admin',
    passWord: 'sa.mapgis'
  }

  private defaultConfig = baseConfigInstance.config

  private shpOr6xOption: any

  // 确认按钮回调函数
  private onExportOk() {
    if (this.markers.length) {
      if (this.exportOptions.exportFileName !== '') {
        const exportedMarkers = this.markers.map(marker => {
          const {
            markerId,
            title,
            description,
            coordinates,
            feature,
            picture
          } = marker

          return {
            id: markerId,
            title,
            description,
            center: coordinates,
            features: [feature]
          }
        })

        switch (this.exportOptions.exportFileType) {
          case 'shp格式':
            this.ouputToShpOr6x(
              this.exportOptions.exportFileName,
              exportedMarkers,
              'shp'
            )
            break
          case '6x格式':
            this.ouputToShpOr6x(
              this.exportOptions.exportFileName,
              exportedMarkers,
              '6x'
            )
            break
          case 'excel格式':
            this.ouputToExcel(
              this.exportOptions.exportFileName,
              exportedMarkers
            )
            break
          default:
            break
        }
      }
    }

    this.emitFinished()
  }

  private onExportCancel() {
    this.emitFinished()
  }

  // 发送请求创建简单要素类 --> 发送请求将简单要素类保存
  private creatFeature(flieName: string, featureSet: any, featureType: string) {
    const { projectionName } = this.defaultConfig // 获取目标参考系
    const { userName, passWord } = this.markerServerConfig
    const getFeatureUrl = `http://${this.markerServerConfig.ip}:${this.markerServerConfig.port}/onemap/featureSet/export?path=${flieName}&srsName=${projectionName}&type=${featureType}&f=json&user=${userName}&password=${passWord}`
    console.log(getFeatureUrl)

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
        const url = `http://${this.markerServerConfig.ip}:9999/open/download?path=${result}&user=${userName}&password=${passWord}`

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

  // 导出形式为shp文件或6x
  private ouputToShpOr6x(flieName: string, exportedMarkers, fileType: string) {
    const setOption = exportMarkersToFileInstance.getSetByMarkers(
      exportedMarkers
    ) // 获取结果集对象
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

  // 导出格式为Excel
  private ouputToExcel(flieName: string, exportedMarkers) {
    const managerBaseUrl = ''
    const url = `${managerBaseUrl}WebService/ExportToExcel`
    const record: Array<Record<string, any>> = []
    for (let i = 0; i < exportedMarkers.length; i += 1) {
      let coord = ''
      let fileType = '点'
      // 区标注只有一个feature，一个feature里可以有多个面
      if (exportedMarkers[i].features) {
        for (let f = 0; f < exportedMarkers[i].features.length; f += 1) {
          if (f > 0) {
            coord += '#'
          }
          const { geometry } = exportedMarkers[i].features[f]
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
        coord = exportedMarkers[i].center.join(',')
      }
      const opt = {
        标注序号: i + 1,
        标注名称: exportedMarkers[i].title,
        标注类型: fileType,
        备注: exportedMarkers[i].description,
        中心点坐标: exportedMarkers[i].center,
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

<style lang="less" scoped>
.marker-export-wrapper {
  .marker-export-body {
    display: flex;
  }
}
</style>
