import { UUID, Feature } from '@mapgis/web-app-framework'
import { markerIconInstance } from '@mapgis/pan-spatial-map-common'

export interface IMarker {
  img: string
  feature: object
  properties: object
  coordinates: number[]
  fid: string
  markerId: string
}

/**
 * 获取marker结构
 * @param geojson
 * @param fid
 * @returns Promise<IMarker | undefined>
 */
export async function getMarker(
  geojson: Feature.FeatureGeoJSON,
  fid: string
): Promise<IMarker | undefined> {
  if (!geojson || !geojson.features || !fid) return
  const feature = geojson.features.find(
    ({ properties }) => properties.fid === fid
  )
  if (!feature) return
  const img = await markerIconInstance.unSelectIcon()
  const coordinates = Feature.getGeoJSONFeatureCenter(feature)
  const { properties } = feature
  return {
    img,
    feature,
    properties,
    coordinates,
    fid: properties.fid,
    markerId: UUID.uuid()
  }
}
