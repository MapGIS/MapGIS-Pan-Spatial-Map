import axios from 'axios'
import { Bound } from '../objects/geometry'
import { FeatureGeoJSON, GFeature } from '../feature/feature-geojson'
import qs from 'qs'

export default class VectorTileMetadataQuery {
  public static serviceInfos: Record<string, any> = []

  public static getServiceInfo(url: string) {
    if (!url) {
      return null
    }
    if (this.serviceInfos[url]) {
      return this.serviceInfos[url]
    }
    const tempUrl: string = url
    const self = this
    const promise = new Promise((resolve, reject) => {
      axios.get(tempUrl).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            self.serviceInfos[url] = data
            resolve(data)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }
}
