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
import { baseConfigInstance } from '@mapgis/pan-spatial-map-common'
import axios from 'axios'
import * as Zondy from '@mapgis/webclient-es6-service'
import XLSX from 'xlsx'

@Component({ name: 'MarkerExport' })
export default class MarkerExport extends Vue {
  @Emit('finished')
  emitFinished() {}

  @Prop({ type: Boolean, default: false }) visible

  @Prop({ type: Array, required: true }) readonly markers!: Array<
    Record<string, any>
  >

  @Prop({ type: Object }) exportConfig: Record<string, any>

  // 表单数据
  private exportOptions = {
    exportFileName: '',
    exportFileType: 'shp格式'
  }

  // 导出格式下拉项配置
  private exportFileTypes = ['shp格式', '6x格式', 'excel格式']

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
    const { username, password } = this.exportConfig
    const getFeatureUrl = `http://${this.exportConfig.ip}:${this.exportConfig.port}/onemap/featureSet/export?path=${flieName}&srsName=${projectionName}&type=${featureType}&f=json&user=${username}&password=${password}`

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
        const url = `http://${this.exportConfig.ip}:9999/open/download?path=${result}&user=${username}&password=${password}`

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
    exportedMarkers = exportedMarkers.map(item => {
      return {
        ...item,
        center: `${item.center[0]}, ${item.center[1]}`,
        features: `type: ${item.features[0].geometry.type}`
      }
    })
    const sheet = XLSX.utils.json_to_sheet(exportedMarkers)
    let blob = this.sheet2blob(sheet)

    if (typeof blob === 'object' && blob instanceof Blob) {
      blob = URL.createObjectURL(blob) // 创建blob地址
    }

    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = blob
    a.download = `${flieName}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
  private sheet2blob(sheet, sheetName) {
    sheetName = sheetName || 'sheet1'
    const workbook = {
      SheetNames: [sheetName],
      Sheets: {}
    }
    workbook.Sheets[sheetName] = sheet
    // 生成excel的配置项
    const wopts = {
      bookType: 'xlsx', // 要生成的文件类型
      bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
      type: 'binary'
    }
    const wbout = XLSX.write(workbook, wopts)
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
    // 字符串转ArrayBuffer
    function s2ab(s) {
      const buf = new ArrayBuffer(s.length)
      const view = new Uint8Array(buf)
      for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
      return buf
    }
    return blob
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
