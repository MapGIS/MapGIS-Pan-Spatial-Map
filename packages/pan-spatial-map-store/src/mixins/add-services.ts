/* eslint-disable max-classes-per-file */
import { Vue, Component, Mixins } from 'vue-property-decorator'
import servicesManagerInstance, {
  ServicesManager,
  ServiceCategory,
  Service
} from '../add-services/services-manager'
import { DataCatalogManager } from '@mapgis/pan-spatial-map-store'
import {
  WidgetMixin,
  Document,
  LoadStatus,
  LayerType
} from '@mapgis/web-app-framework'

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
          serverType: LayerType.ArcGISMapImage
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
