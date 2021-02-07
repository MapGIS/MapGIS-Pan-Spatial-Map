import * as Zondy from '@mapgis/webclient-es6-service'

class ExportMarkersToFile {
  getSetByMarkers(markers: Record<string, any>[]) {
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
  geojsonFeatureToIgsFeature(
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

export default new ExportMarkersToFile()
