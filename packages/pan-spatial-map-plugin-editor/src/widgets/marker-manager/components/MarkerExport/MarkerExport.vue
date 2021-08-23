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
import { baseConfigInstance } from '@mapgis/pan-spatial-map-store'
import axios from 'axios'
import * as Zondy from '@mapgis/webclient-es6-service'

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
    const { projectionName } = baseConfigInstance.config // 获取目标参考系
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
    const setOption = this.markers2Features(exportedMarkers) // 获取结果集对象
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

  private markers2Features(markers: Record<string, any>[]) {
    // 创建点、线、区要素数据集
    const featureSet1 = new Zondy.Common.FeatureSet()
    const featureSet2 = new Zondy.Common.FeatureSet()
    const featureSet3 = new Zondy.Common.FeatureSet()
    // 设置属性结构
    const cAttStruct = new Zondy.Common.CAttStruct({
      FldName: ['名称', '描述', '中心点坐标', '坐标串'],
      FldNumber: 4,
      FldType: ['string', 'string', 'string', 'string']
    })
    featureSet1.AttStruct = cAttStruct
    featureSet2.AttStruct = cAttStruct
    featureSet3.AttStruct = cAttStruct
    const setOption = {
      featureSet1,
      featureSet2,
      featureSet3
    }
    for (let i = 0; i < markers.length; i += 1) {
      const marker = markers[i]
      const { features, title, description, coordinates, center } = marker
      for (let fl = 0; fl < features.length; fl += 1) {
        const igsFeature = this.geojsonFeatureToIgsFeature(
          features[fl],
          title,
          description,
          center
        )
        const fType = igsFeature.ftype
        if (fType === 1) {
          setOption.featureSet1.addFeature(igsFeature)
        } else if (fType === 2) {
          setOption.featureSet2.addFeature(igsFeature)
        } else if (fType === 3) {
          setOption.featureSet3.addFeature(igsFeature)
        }
      }
    }
    return setOption
  }

  // 点、线、区要素集合
  private geojsonFeatureToIgsFeature(
    geojsonFeature: any,
    title: string,
    description: string,
    center: number[]
  ) {
    let coordStr = ''
    const { geometry } = geojsonFeature
    const { type, coordinates } = geometry
    // 随机输出1~8之间的整数,作为新添加的要素的颜色号
    const pntColor = Math.floor(Math.random() * 8 + 1)
    let fGeom: any
    let GraphicInfo: any
    let fType = 0
    // 要素之间用'#'分隔，坐标之间用' '分隔，xy之间用','分隔
    if (type === 'Point') {
      coordStr += coordinates.join(',')
      // 设置当前点要素的几何信息
      fGeom = new Zondy.Common.FeatureGeometry({
        PntGeom: [new Zondy.Common.GPoint(coordinates[0], coordinates[1])]
      })
      // 描述点要素的符号参数信息
      const pointInfo = new Zondy.Common.CPointInfo({
        Angle: 0,
        Color: pntColor,
        Space: 0,
        SymHeight: 12,
        SymID: 98,
        SymWidth: 12
      })
      // 设置当前点要素的图形参数信息
      GraphicInfo = new Zondy.Common.WebGraphicsInfo({
        InfoType: 1,
        PntInfo: pointInfo
      })
      fType = 1
    } else if (type === 'LineString') {
      const coords: any[] = []
      for (let l = 0; l < coordinates.length; l += 1) {
        if (l > 0) {
          coordStr += ' '
        }
        coordStr += coordinates[l].join(',')
        coords.push(
          new Zondy.Common.Point2D(coordinates[l][0], coordinates[l][1])
        )
      }
      // 构成折线的弧段
      const gArc = new Zondy.Common.Arc(coords)
      const gAnyLine = new Zondy.Common.AnyLine([gArc])
      // 设置线要素的几何信息
      const gline = new Zondy.Common.GLine(gAnyLine)
      // 设置要素的几何信息
      fGeom = new Zondy.Common.FeatureGeometry({ LinGeom: [gline] })
      // 设置添加线要素的图形参数信息
      const clineInfo = new Zondy.Common.CLineInfo({
        Color: pntColor,
        LinStyleID: 0,
        LinStyleID2: 1,
        LinWidth: 2,
        Xscale: 10,
        Yscale: 10
      })
      // 设置要素的图形参数信息
      GraphicInfo = new Zondy.Common.WebGraphicsInfo({
        InfoType: 2,
        LinInfo: clineInfo
      })

      fType = 2
    } else if (type === 'Polygon') {
      const gArcs: any[] = []
      for (let p = 0; p < coordinates.length; p += 1) {
        if (p > 0) {
          coordStr += '#'
        }
        const arcPoints = coordinates[p]
        const coords: any[] = []
        for (let a = 0; a < arcPoints.length; a += 1) {
          if (a > 0) {
            coordStr += ' '
          }
          coordStr += arcPoints[a].join(',')
          coords.push(
            new Zondy.Common.Point2D(arcPoints[a][0], arcPoints[a][1])
          )
        }
        const gArc = new Zondy.Common.Arc(coords)
        gArcs.push(gArc)
      }
      // 构成区要素折线
      const gAnyLine = new Zondy.Common.AnyLine(gArcs)
      // 构成区要素
      const gRegion = new Zondy.Common.GRegion([gAnyLine])
      // 构成区要素的几何信息
      fGeom = new Zondy.Common.FeatureGeometry({ RegGeom: [gRegion] })
      // 设置区要素的图形参数信息
      const cRegionInfo = new Zondy.Common.CRegionInfo({
        EndColor: 1,
        FillColor: pntColor,
        FillMode: 0,
        OutPenWidth: 1,
        OverMethod: 0,
        PatAngle: 1,
        PatColor: 1,
        PatHeight: 1,
        PatID: 27,
        PatWidth: 1
      })
      // 要素图形参数信息
      GraphicInfo = new Zondy.Common.WebGraphicsInfo({
        InfoType: 3,
        RegInfo: cRegionInfo
      })
      fType = 3
    }
    // 设置添加点要素的属性信息
    const attValue = [title, description, center.join(','), coordStr]
    // 创建一个要素
    const feature = new Zondy.Common.Feature({
      fGeom,
      GraphicInfo,
      AttValue: attValue
    })
    // 设置要素类型
    feature.setFType(fType)
    return feature
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
