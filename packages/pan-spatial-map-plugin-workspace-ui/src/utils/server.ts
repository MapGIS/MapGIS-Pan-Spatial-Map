import {
  ISystemConfigServer,
  SystemConfig,
  IDataCatalogConfigServer,
  DataCatalogConfig,
  IBaseLayersConfigServer,
  BaseLayersConfig
} from '@mapgis/pan-spatial-map-store'
import { getSystemConfig } from '../api/system'
import { getDataCatalogConfig } from '../api/data-catalog'
import { getBaseLayersConfig } from '../api/base-layers'

class SystemConfigServer implements ISystemConfigServer {
  loadConfig(): Promise<any> {
    return getSystemConfig()
  }
}

class DataCatalogConfigServer implements IDataCatalogConfigServer {
  loadConfig(): Promise<any> {
    return getDataCatalogConfig()
  }
}

class BaseLayersConfigServer implements IBaseLayersConfigServer {
  loadConfig(): Promise<any> {
    return getBaseLayersConfig()
  }
}

export default function startServer() {
  SystemConfig.getInstance().server = new SystemConfigServer()
  DataCatalogConfig.getInstance().server = new DataCatalogConfigServer()
  BaseLayersConfig.getInstance().server = new BaseLayersConfigServer()
}
