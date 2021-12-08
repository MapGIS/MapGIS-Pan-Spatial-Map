import baseConfigInstance from '../config/base'
import axios from 'axios'

class DataStoreCatalog {
  private _dataStoreCatalog: Array<Record<string, string | null>> | null = null

  private async getDataStoreCatalogList() {
    if (!this._dataStoreCatalog) {
      const { data } = await axios.get(
        `http://${baseConfigInstance.config.DataStoreIp}:${baseConfigInstance.config.DataStorePort}/datastore/rest/catalog/services`
      )
      this._dataStoreCatalog = data.t || []
      return this._dataStoreCatalog
    }
    return this._dataStoreCatalog
  }
}

const dataCatalogManager = new DataStoreCatalog()

export default dataCatalogManager
