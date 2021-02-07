export interface ServiceCategory {
  name: string
  desc: string
}

export interface ServiceType {
  label: string
  value: string
}

export interface Service {
  id: string
  name: string
  gdbp?: string
  category: string
  type: string
  url?: string
  visible: boolean
  [props: string]: unknown
}

export class ServicesManager {
  private _serviceCategories: ServiceCategory[] = [{ name: 'OGC', desc: 'OGC' }]

  private _serviceTypes2D: ServiceType[] = [
    { label: 'WMS服务', value: 'WMS' },
    { label: 'WMTS服务', value: 'WMTS' },
    { label: '天地图', value: 'tianDiTu' },
    { label: 'ArcGISREST服务', value: 'arcgis' },
    { label: '地图文档', value: 'doc' },
    { label: '瓦片', value: 'tile' },
    { label: '数据源图层服务', value: 'layer' }
  ]

  private _serviceTypes3D: ServiceType[] = [
    { label: 'WMS服务', value: 'WMS' },
    { label: 'WMTS服务', value: 'WMTS' },
    { label: '天地图', value: 'tianDiTu' },
    { label: 'ArcGISREST服务', value: 'arcgis' },
    { label: '地图文档', value: 'doc' },
    { label: '瓦片', value: 'tile' },
    { label: '百度', value: 'baidu' },
    { label: '高德', value: 'gaode' },
    { label: '谷歌', value: 'google' },
    { label: '谷歌扩展', value: 'googleExt' }
  ]

  private _fileTypes2D: ServiceType[] = [
    { label: '本地tif文件', value: 'tif' },
    { label: '本地shp文件', value: 'shp' },
    { label: '本地6x文件', value: '6x' },
    { label: '本地GeoJSON文件', value: 'GeoJSON' }
  ]

  private _fileTypes3D: ServiceType[] = [
    { label: 'KML', value: 'KML' },
    { label: 'KMZ', value: 'KMZ' },
    { label: 'CZML', value: 'CZML' },
    { label: 'GeoJSON', value: 'GeoJSON' }
  ]

  private _services: Service[] = []

  constructor() {}

  public get serviceCategories() {
    return this._serviceCategories
  }

  public set serviceCategories(serviceCategories: ServiceCategory[]) {
    this._serviceCategories = serviceCategories
  }

  public addServiceCategory(serviceCategory: ServiceCategory) {
    this._serviceCategories.push(serviceCategory)
  }

  public get serviceTypes2D() {
    return this._serviceTypes2D
  }

  public get serviceTypes3D() {
    return this._serviceTypes3D
  }

  public get fileTypes2D() {
    return this._fileTypes2D
  }

  public get fileTypes3D() {
    return this._fileTypes3D
  }

  public get services() {
    return this._services
  }

  public set services(services: Service[]) {
    this._services = [...services]
  }

  public addService(service: Service) {
    this._services.push(service)
  }

  public deleteService(service: Service) {
    const index = this._services.indexOf(service)
    this._services.splice(index, 1)
  }
}

const servicesManagerInstance: ServicesManager = new ServicesManager()

export default servicesManagerInstance
