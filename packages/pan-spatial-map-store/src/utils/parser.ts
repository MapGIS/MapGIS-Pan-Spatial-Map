import {
  FeatureGeoJSON,
  GFeature,
  GGeometry,
  GeoCRS
} from '../service/query-features'

declare const Zondy: any

interface Parse {
  toFeatureGeometry(): any

  toTangram(): any
}

class GGeometryPoint implements GGeometry, Parse {
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
    const point = new Zondy.Object.GPoint(x, y)
    return new Zondy.Object.FeatureGeometry({ PntGeom: [point] })
  }

  public toTangram() {
    const [x, y] = this.coordinates
    return new Zondy.Object.Point2D(x, y)
  }
}

class GGeometryLine implements GGeometry, Parse {
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
      return new Zondy.Object.Point2D(x, y)
    })
    const arc = new Zondy.Object.Arc(coords)
    const anyLine = new Zondy.Object.AnyLine([arc])
    const gline = new Zondy.Object.GLine(anyLine)
    return new Zondy.Object.FeatureGeometry({ LinGeom: [gline] })
  }

  public toTangram() {
    const coords = this.coordinates.map(([x, y]) => {
      return new Zondy.Object.Point2D(x, y)
    })
    return new Zondy.Object.PolyLine(coords)
  }
}

class GGeometryPolygon implements GGeometry, Parse {
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
        return new Zondy.Object.Point2D(x, y)
      })
      return new Zondy.Object.Arc(coords)
    })
    const anyLine = new Zondy.Object.AnyLine(arcs)
    const gRegion = new Zondy.Object.GRegion([anyLine])
    return new Zondy.Object.FeatureGeometry({ RegGeom: [gRegion] })
  }

  public toTangram() {
    const coords = this.coordinates[0].map(([x, y]) => {
      return new Zondy.Object.Point2D(x, y)
    })
    return new Zondy.Object.Polygon(coords)
  }
}

class GGeometryMultiPolygon implements GGeometry, Parse {
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
        return new Zondy.Object.Point2D(x, y)
      })
      return new Zondy.Object.Arc(coords)
    })
    const anyLine = new Zondy.Object.AnyLine(arcs)
    const gRegion = new Zondy.Object.GRegion([anyLine])
    return new Zondy.Object.FeatureGeometry({ RegGeom: [gRegion] })
  }

  public toTangram() {
    const coords = this.coordinates[0][0].map(([x, y]) => {
      return new Zondy.Object.Point2D(x, y)
    })
    return new Zondy.Object.Polygon(coords)
  }
}

class Parser {
  /**
   * 转换成Zondy.Object.Tangram对象
   * @param featureGeoJSON FeatureGeoJSON
   */
  public static changeToTangram(featureGeoJSON: FeatureGeoJSON)

  /**
   * 转换成Zondy.Object.Tangram对象
   * @param gFeature GFeature
   */
  public static changeToTangram(gFeature: GFeature)

  /**
   * 转换成Zondy.Object.Tangram对象
   * @param gGeometry GGeometry
   */
  public static changeToTangram(gGeometry: GGeometry)

  public static changeToTangram(obj: FeatureGeoJSON | GFeature | GGeometry) {
    const { type } = obj
    switch (type) {
      case 'FeatureCollection':
        return this.changeFeatureGeoJSONToTangram(obj as FeatureGeoJSON)
      case 'Feature':
        return this.changeGFeatureToTangram(obj as GFeature)
      default:
        return undefined
    }
  }

  private static changeFeatureGeoJSONToTangram(featureGeoJSON: FeatureGeoJSON) {
    const { features } = featureGeoJSON
    return features.map(feature => this.changeGFeatureToTangram(feature))
  }

  private static changeGFeatureToTangram(gFeature: GFeature) {
    const { geometry } = gFeature
    return this.changeGGeometryToTangram(geometry)
  }

  private static changeGGeometryToTangram(gGeometry: GGeometry) {
    const { type, coordinates } = gGeometry

    let geometry: Parse

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
        break
    }

    return geometry.toTangram()
  }
}

export default Parser
