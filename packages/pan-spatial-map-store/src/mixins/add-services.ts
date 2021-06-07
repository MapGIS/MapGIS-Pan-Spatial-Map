/* eslint-disable max-classes-per-file */
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { IDocument, Layer } from '@mapgis/webclient-store'
import servicesManagerInstance, {
  ServicesManager,
  ServiceCategory,
  Service
} from '../add-services/services-manager'
import {
  dataCatalogManagerInstance,
  DataCatalogManager
} from '@mapgis/pan-spatial-map-store'
import {
  WidgetMixin,
  Document,
  LoadStatus,
  LayerType
} from '@mapgis/web-app-framework'

const { serviceLayerType, SubLayerType } = Layer
@Component({})
export default class AddServicesMixin extends Mixins(WidgetMixin) {
  private servicesManager: ServicesManager = servicesManagerInstance

  public get serviceCategories() {
    return this.servicesManager.serviceCategories
  }

  public set serviceCategories(serviceCategories: ServiceCategory[]) {
    this.servicesManager.serviceCategories = serviceCategories
  }

  public addServiceCategory(serviceCategory: ServiceCategory) {
    this.servicesManager.addServiceCategory(serviceCategory)
  }

  public get serviceTypes2D() {
    return this.servicesManager.serviceTypes2D
  }

  public get serviceTypes3D() {
    return this.servicesManager.serviceTypes3D
  }

  public get fileTypes2D() {
    return this.servicesManager.fileTypes2D
  }

  public get fileTypes3D() {
    return this.servicesManager.fileTypes3D
  }

  public get services() {
    return this.servicesManager.services
  }

  public set services(services: Service[]) {
    this.servicesManager.services = [...services]
  }

  public addService(service: Service) {
    // 添加服务
    // 不再通过这里添加service数据了，直接在对应的组件里添加service
    // this.servicesManager.addService(service)

    // 把服务对应的图层加入到document中
    if (service.visible && service.visible === true) {
      this.addLayerToDocumentByService(service)
    }
  }

  public deleteService(service: Service) {
    // 把服务对应的图层从document中移除
    this.removeLayerFromDocumentByService(service)

    // 删除服务
    this.servicesManager.deleteService(service)
  }

  public changeServiceState(serviceIndex, state) {
    // 服务的状态由“不用”变“在用”时将服务对应的图层添加到document中
    // 服务的状态由“在用”变为“不用”时将服务对应的图层从document上移除
  }

  private createLayerByService(service: Service) {
    let layer: Record<string, unknown> = {}
    let layerExtInfo: Record<string, unknown> = {}
    const { id, type, ip, port, name, gdbp, url, layerType, token } = service
    layer = { id, serverName: name, title: name }

    switch (type) {
      case 'WMS':
        // 修改说明：serverUrl为MapboxWmsLayer、MpLayerList组件所需
        // 修改人：马原野 2020年11月11日
        layerExtInfo = {
          serverUrl: url,
          type: serviceLayerType.RasterTile,
          subtype: SubLayerType.OgcWmsLayer
        }
        break
      case 'WMTS':
        // 修改说明：serverUrl为MapboxWmtsLayer、MpLayerList组件所需
        // 修改人：马原野 2020年11月11日
        layerExtInfo = {
          serverUrl: url,
          type: serviceLayerType.RasterTile,
          subtype: SubLayerType.OgcWmtsLayer
        }
        break
      case 'tile':
        layerExtInfo = {
          ip,
          port,
          type: serviceLayerType.RasterTile,
          subtype: SubLayerType.IgsTileLayer
        }
        break
      case 'doc':
        layerExtInfo = {
          ip,
          port,
          type: serviceLayerType.RasterTile,
          subtype: SubLayerType.IgsDocLayer,
          title: name
        }
        break
      case 'layer':
        layerExtInfo = {
          ip,
          port,
          gdbps: gdbp || url,
          id,
          type: serviceLayerType.RasterTile,
          subtype: SubLayerType.IgsVectorLayer
        }
        break
      case 'shp':
      case 'tif':
      case '6x':
        // vue老版不支持
        break
      case 'tianDiTu':
        layerExtInfo = {
          baseURL: url,
          id,
          token,
          type: serviceLayerType.RasterTile,
          subtype: SubLayerType.RasterTiandituLayer
        }
        break
      case 'arcgis':
        layerExtInfo = {
          serverUrl: url,
          id,
          type: serviceLayerType.RasterTile,
          subtype: SubLayerType.RasterArcgisLayer
        }
        break
      case 'baidu':
        layer = {
          ip,
          port,
          id,
          layerType,
          subtype: 'BaiduLayer'
        }
        break
      case 'gaode':
        layer = {
          ip,
          port,
          id,
          layerType,
          subtype: 'GaodeLayer'
        }
        break
      case 'google':
      case 'googleExt':
        let tempLayerType: any
        let pType: any
        if (type === 'googleExt') {
          pType = layerType
        } else {
          tempLayerType = layerType
        }
        layer = {
          ip,
          port,
          id,
          layerType: tempLayerType,
          pType,
          subtype: 'GoogleLayer'
        }
        break
      default:
        break
    }

    // 合并图层基础信息和图层特有的信息
    layer = { ...layer, ...layerExtInfo }

    return layer
  }

  public async addLayerToDocumentByService(service: Service) {
    const doc: Document = this.document
    let dealService = JSON.parse(JSON.stringify(service))
    const { ip, port, type, gdbp, name, url } = dealService
    switch (type) {
      case 'doc':
        dealService = {
          ip,
          port,
          guid: dealService.id,
          serverName: name,
          name,
          serverType: LayerType.IGSMapImage
        }
        break
      case 'layer':
        dealService = {
          ip,
          port,
          guid: dealService.id,
          gdbps: gdbp,
          name,
          serverType: LayerType.IGSVector
        }
        break
      case 'tile':
        dealService = {
          ip,
          port,
          guid: dealService.id,
          serverName: name,
          name,
          serverType: LayerType.IGSTile
        }
        break
      case 'WMS':
        dealService = {
          guid: dealService.id,
          name,
          serverURL: url,
          serverType: LayerType.OGCWMS
        }
        break
      case 'WMTS':
        dealService = {
          guid: dealService.id,
          name,
          serverURL: url,
          serverType: LayerType.OGCWMTS
        }
        break
      case 'tianDiTu':
        dealService = {
          guid: dealService.id,
          serverURL: url,
          name,
          serverType: LayerType.OGCWMTS
        }
        break
      case 'arcgis':
        dealService = {
          guid: dealService.id,
          serverURL: url,
          name,
          serverType: LayerType.arcGISMapImage
        }
        break
      default:
        break
    }
    const layer = DataCatalogManager.generateLayerByConfig(dealService)
    if (layer) {
      if (layer.loadStatus === LoadStatus.notLoaded) {
        await layer.load()
      }
      doc.defaultMap.add(layer)
    }
  }

  public removeLayerFromDocumentByService(service: Service) {
    const doc: Document = this.document
    const layer = doc.defaultMap.findLayerById(service.id)
    doc.defaultMap.remove(layer)
  }
}
