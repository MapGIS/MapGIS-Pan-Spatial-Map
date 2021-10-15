import { UUID, Feature } from '@mapgis/web-app-framework'
import { markerIconInstance } from '@mapgis/pan-spatial-map-common'

/**
 * 获取marker结构
 * @param geojson
 * @param fid
 * @returns <Promise>
 */
export async function getMarker(geojson: Feature.FeatureGeoJSON, fid: string) {
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
