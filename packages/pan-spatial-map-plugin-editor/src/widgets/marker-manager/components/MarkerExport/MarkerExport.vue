<template>
  <div class="marker-export-wrapper">
    <a-form-model
      :model="formExport"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-model-item label="文件名称:">
        <a-input v-model="formExport.exportFileName"> </a-input>
      </a-form-model-item>
      <a-form-model-item label="导出格式:">
        <a-select v-model="formExport.exportFileType">
          <a-select-option v-for="item in exportFileTypes" :key="item">{{
            item
          }}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-divider />
      <div class="btn-group">
        <a-button type="primary" @click="onClickConfirm">确认</a-button>
        <a-button @click="onClickCancel">取消</a-button>
      </div>
    </a-form-model>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Vue, Prop, Emit } from 'vue-property-decorator'
import { ThemeStyleMixin } from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  ExportMarkersToFileInstance
} from '@mapgis/pan-spatial-map-store'
import axios from 'axios'

@Component({ name: 'MarkerExport' })
export default class MarkerExport extends Mixins() {
  @Prop({ type: Array, required: true }) readonly markers!: Array<
    Record<string, any>
  >

  // 表单数据
  private formExport = {
    exportFileName: '',
    exportFileType: 'shp格式'
  }

  // 导出格式下拉项配置
  private exportFileTypes = ['shp格式', '6x格式', 'excel格式']

  private markerServerConfig = {
    ip: 'localhost',
    port: '6163',
    isHorizontalSet: 'true',
    userName: 'admin',
    passWord: 'sa.mapgis'
  }

  private defaultConfig = baseConfigInstance.config

  private shpOr6xOption: any

  @Emit('closeModal')
  closeModal() {}

  // 取消按钮回调函数
  onClickCancel() {
    this.closeModal()
  }

  // 确认按钮回调函数
  onClickConfirm() {
    this.closeModal()
    if (this.formExport.exportFileName !== '') {
      switch (this.formExport.exportFileType) {
        case 'shp格式':
          this.ouputToShpOr6x(this.formExport.exportFileName, 'shp')
          break
        case '6x格式':
          this.ouputToShpOr6x(this.formExport.exportFileName, '6x')
          break
        case 'excel格式':
          this.ouputToExcel(this.formExport.exportFileName)
          break
        default:
          break
      }
    }
  }

  // 发送请求创建简单要素类 --> 发送请求将简单要素类保存
  creatFeature(flieName: string, featureSet: any, featureType: string) {
    const { projectionName } = this.defaultConfig // 获取目标参考系
    const { userName, passWord } = this.markerServerConfig
    const getFeatureUrl = `http://${this.markerServerConfig.ip}:${this.markerServerConfig.port}/onemap/featureSet/export?path=${flieName}&srsName=${projectionName}&type=${featureType}&f=json&user=${userName}&password=${passWord}`
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

  // 导出格式为Excel
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

<style lang="less" scoped>
.ant-form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}
.ant-divider {
  margin: 12px 0;
}
.btn-group {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .ant-btn {
    margin-left: 8px;
  }
}
</style>
