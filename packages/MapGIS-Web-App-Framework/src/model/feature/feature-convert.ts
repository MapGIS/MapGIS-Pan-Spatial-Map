import * as Zondy from '@mapgis/webclient-es6-service'
import { Bound, GeometryExp } from '../objects/geometry'
import {
  XY,
  PntGeom,
  LinGeom,
  RegGeom,
  FeatureIGSSFEle,
  FeatureIGSAttStruct,
  FeatureIGS
} from './feature'

import { GGeometry, GeoCRS, GFeature, FeatureGeoJSON } from './feature-geojson'

interface IGeometryConvert {
  toFeatureGeometry(): any

  toTangram(): any
}

class GGeometryPoint implements GGeometry, IGeometryConvert {
  public get type() {
    return 'Point'
  }

  private coors: [number, number] = [NaN, NaN]

  public get coordinates() {
    return this.coors
  }

  private geoCRS?: GeoCRS

  public get crs() {
    return this.geoCRS
  }

  public constructor(coors: unknown[], crs?: GeoCRS) {
    this.coors = coors as [number, number]
    this.geoCRS = crs
  }

  public toFeatureGeometry() {
    const [x, y] = this.coordinates
    const point = new Zondy.Common.GPoint(x, y)
    return new Zondy.Common.FeatureGeometry({ PntGeom: [point] })
  }

  public toTangram() {
    const [x, y] = this.coordinates
    return new Zondy.Common.Point2D(x, y)
  }
}

class GGeometryLine implements GGeometry, IGeometryConvert {
  public get type() {
    return 'LineString'
  }

  private coors: [number, number][] = []

  public get coordinates() {
    return this.coors
  }

  private geoCRS?: GeoCRS

  public get crs() {
    return this.geoCRS
  }

  public constructor(coors: unknown[], crs?: GeoCRS) {
    this.coors = coors as [number, number][]
    this.geoCRS = crs
  }

  public toFeatureGeometry() {
    const coords = this.coordinates.map(([x, y]) => {
      return new Zondy.Common.Point2D(x, y)
    })
    const arc = new Zondy.Common.Arc(coords)
    const anyLine = new Zondy.Common.AnyLine([arc])
    const gline = new Zondy.Common.GLine(anyLine)
    return new Zondy.Common.FeatureGeometry({ LinGeom: [gline] })
  }

  public toTangram() {
    const coords = this.coordinates.map(([x, y]) => {
      return new Zondy.Common.Point2D(x, y)
    })
    return new Zondy.Common.PolyLine(coords)
  }
}

class GGeometryPolygon implements GGeometry, IGeometryConvert {
  public get type() {
    return 'Polygon'
  }

  private coors: [number, number][][] = []

  public get coordinates() {
    return this.coors
  }

  private geoCRS?: GeoCRS

  public get crs() {
    return this.geoCRS
  }

  public constructor(coors: unknown[], crs?: GeoCRS) {
    this.coors = coors as [number, number][][]
    this.geoCRS = crs
  }

  public toFeatureGeometry() {
    const arcs = this.coordinates.map(line => {
      const coords = line.map(([x, y]) => {
        return new Zondy.Common.Point2D(x, y)
      })
      return new Zondy.Common.Arc(coords)
    })
    const anyLine = new Zondy.Common.AnyLine(arcs)
    const gRegion = new Zondy.Common.GRegion([anyLine])
    return new Zondy.Common.FeatureGeometry({ RegGeom: [gRegion] })
  }

  public toTangram() {
    const coords = this.coordinates[0].map(([x, y]) => {
      return new Zondy.Common.Point2D(x, y)
    })
    return new Zondy.Common.Polygon(coords)
  }
}

class GGeometryMultiPolygon implements GGeometry, IGeometryConvert {
  public get type() {
    return 'MultiPolygon'
  }

  private coors: [number, number][][][] = []

  public get coordinates() {
    return this.coors
  }

  private geoCRS?: GeoCRS

  public get crs() {
    return this.geoCRS
  }

  public constructor(coors: unknown[], crs?: GeoCRS) {
    this.coors = coors as [number, number][][][]
    this.geoCRS = crs
  }

  public toFeatureGeometry() {
    const arcs = this.coordinates[0].map(line => {
      const coords = line.map(([x, y]) => {
        return new Zondy.Common.Point2D(x, y)
      })
      return new Zondy.Common.Arc(coords)
    })
    const anyLine = new Zondy.Common.AnyLine(arcs)
    const gRegion = new Zondy.Common.GRegion([anyLine])
    return new Zondy.Common.FeatureGeometry({ RegGeom: [gRegion] })
  }

  public toTangram() {
    const coords = this.coordinates[0][0].map(([x, y]) => {
      return new Zondy.Common.Point2D(x, y)
    })
    return new Zondy.Common.Polygon(coords)
  }
}

export default class FeatureConvert {
  /**
   * IGServer数据结构转为GeoJSON数据结构
   * @param igsFeatures
   */
  public static featureIGSToFeatureGeoJSON(igsFeatures: FeatureIGS) {
    const dataCount =
      igsFeatures.TotalCount > -1
        ? igsFeatures.TotalCount
        : igsFeatures.SFEleArray.length
    const geojsonFeatures: FeatureGeoJSON = {
      type: 'FeatureCollection',
      features: [],
      dataCount
    }
    if (!igsFeatures.SFEleArray) {
      return geojsonFeatures
    }
    const tags = igsFeatures.AttStruct.FldName
    const alias = igsFeatures.AttStruct.FldAlias
    const fldType = igsFeatures.AttStruct.FldType
    for (let i = 0; i < igsFeatures.SFEleArray.length; i += 1) {
      const sfele = igsFeatures.SFEleArray[i]
      const { ftype, FID, bound, AttValue, fGeom } = sfele
      const properties = { fid: FID }
      if (AttValue && tags) {
        for (let a = 0; a < AttValue.length; a += 1) {
          const val = AttValue[a]
          const tag = alias && alias[a] && alias[a] !== '' ? alias[a] : tags[a]
          if (
            val !== null &&
            fldType &&
            ['int', 'double', 'float', 'long', 'number'].includes(fldType[a])
          ) {
            properties[tag] = Number(val)
          } else {
            properties[tag] = val
          }
        }
      }

      let coordinates: any[] = []
      let type = ''
      if (ftype === 1) {
        // 点
        if (fGeom.PntGeom) {
          const { Dot } = fGeom.PntGeom[0]
          if (Dot) {
            coordinates = [Dot.x, Dot.y]
          }
        }
        type = 'Point'
      } else if (ftype === 2) {
        // 线
        if (fGeom.LinGeom) {
          const { Line } = fGeom.LinGeom[0]
          if (Line) {
            const { Arcs } = Line
            if (Arcs) {
              const LineDots = Arcs[0].Dots
              if (LineDots) {
                for (let l = 0; l < LineDots.length; i += 1) {
                  const coord = [LineDots[l].x, LineDots[l].y]
                  coordinates.push(coord)
                }
              }
            }
          }
        }
        type = 'LineString'
      } else if (ftype === 3) {
        // 面
        if (fGeom.RegGeom) {
          const { Rings } = fGeom.RegGeom[0]
          if (Rings) {
            const { Arcs } = Rings[0]
            if (Arcs) {
              for (let p = 0; p < Arcs.length; p += 1) {
                const arc: any[] = []
                const PolygonDots = Arcs[p].Dots
                if (PolygonDots) {
                  for (let d = 0; d < PolygonDots.length; d += 1) {
                    const coord = [PolygonDots[d].x, PolygonDots[d].y]
                    arc.push(coord)
                  }
                  coordinates.push(arc)
                }
              }
            }
          }
        }
        type = 'Polygon'
      }

      const geometry = {
        type,
        coordinates
      }

      const feature: GFeature = {
        type: 'Feature',
        properties,
        geometry,
        bound: { ...bound }
      }
      geojsonFeatures.features.push(feature)
    }
    return geojsonFeatures
  }

  /**
   * GeoJSON数据结构转IGServer数据结构
   * @param geojsonFeatures
   */
  public static featureGeoJSONTofeatureIGS(geojsonFeatures: FeatureGeoJSON) {
    const FldAlias: any[] = []
    const FldName: any[] = []
    const FldType: any[] = []
    let FldNumber = 0
    const SFEleArray: FeatureIGSSFEle[] = []
    if (geojsonFeatures.features.length > 0) {
      const pro = geojsonFeatures.features[0].properties
      Object.keys(pro).forEach(key => {
        if (key !== 'geoCenter') {
          FldAlias.push(null)
          FldName.push(key)
          FldNumber += 1
          if (typeof pro[key] === 'string') {
            FldType.push('string')
          } else if (typeof pro[key] === 'number') {
            FldType.push('double')
          }
        }
      })
    }
    const AttStruct: FeatureIGSAttStruct = {
      FldAlias,
      FldName,
      FldNumber,
      FldType
    }
    for (let i = 0; i < geojsonFeatures.features.length; i += 1) {
      const PntGeom: PntGeom[] = []
      const LinGeom: LinGeom[] = []
      const RegGeom: RegGeom[] = []
      let ftype = 0
      let bound: Bound = {}
      const { geometry } = geojsonFeatures.features[i]
      if (geometry.type === 'Point') {
        ftype = 1
        bound = GeometryExp.calculateBound([geometry.coordinates])
        const Dot: XY = {
          x: geometry.coordinates[0],
          y: geometry.coordinates[1]
        }
        PntGeom.push({
          Dot,
          GID: 0
        })
      } else if (geometry.type === 'LineString') {
        ftype = 2
        bound = GeometryExp.calculateBound(geometry.coordinates)
        const dots: XY[] = []
        for (let j = 0; j < geometry.coordinates.length; j += 1) {
          dots.push({
            x: geometry.coordinates[j][0],
            y: geometry.coordinates[j][1]
          })
        }
        LinGeom.push({
          GID: 0,
          Line: {
            Arcs: [
              {
                ArcID: 0,
                Dots: dots
              }
            ]
          }
        })
      } else if (geometry.type === 'Polygon') {
        ftype = 3
        bound = GeometryExp.calculateBound(geometry.coordinates[0])
        const dots: XY[] = []
        for (let j = 0; j < geometry.coordinates[0].length; j += 1) {
          dots.push({
            x: geometry.coordinates[0][j][0],
            y: geometry.coordinates[0][j][1]
          })
        }
        RegGeom.push({
          GID: 0,
          Rings: [
            {
              Arcs: [
                {
                  ArcID: 0,
                  Dots: dots
                }
              ]
            }
          ]
        })
      }
      const AttValue: any[] = []
      const property = geojsonFeatures.features[i].properties
      Object.keys(property).forEach(key => {
        if (key !== 'geoCenter') {
          AttValue.push(property[key])
        }
      })

      const data: FeatureIGSSFEle = {
        AttValue,
        FID: i,
        GraphicInfo: {
          AnnInfo: null,
          InfoType: null,
          LinInfo: null,
          PntInfo: null,
          RegInfo: null
        },
        bound,
        fGeom: {
          EntityGeom: [],
          LinGeom,
          PntGeom,
          RegGeom,
          StreamGeom: null,
          SurfaceGeom: []
        },
        ftype
      }

      SFEleArray.push(data)
    }
    const result: FeatureIGS = {
      AttStruct,
      SFEleArray,
      TotalCount: geojsonFeatures.dataCount || geojsonFeatures.features.length
    }
    const featureSet = new Zondy.Common.FeatureSet(result)
    return featureSet
  }

  public static featureGeoJSONToTangram(
    obj: FeatureGeoJSON | GFeature | GGeometry
  ) {
    const { type } = obj
    switch (type) {
      case 'FeatureCollection':
        return this.toTangram(obj as FeatureGeoJSON)
      case 'Feature':
        return this.featureToTangram(obj as GFeature)
      default:
        return undefined
    }
  }

  private static toTangram(featureGeoJSON: FeatureGeoJSON) {
    const { features } = featureGeoJSON
    return features.map(feature => this.featureToTangram(feature))
  }

  private static featureToTangram(gFeature: GFeature) {
    const { geometry } = gFeature
    return this.geometryToTangram(geometry)
  }

  private static geometryToTangram(gGeometry: GGeometry) {
    const { type, coordinates } = gGeometry

    let geometry: IGeometryConvert

    switch (type) {
      case 'Point':
        geometry = new GGeometryPoint(coordinates)
        break
      case 'LineString':
        geometry = new GGeometryLine(coordinates)
        break
      case 'Polygon':
        geometry = new GGeometryPolygon(coordinates)
        break
      case 'MultiPolygon':
        geometry = new GGeometryMultiPolygon(coordinates)
        break
      default:
        throw new Error(`未实现类型:${type}`)
    }

    return geometry.toTangram()
  }
}
