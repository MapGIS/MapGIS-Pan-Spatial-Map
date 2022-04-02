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
 * @param propertiesOption properties属性。{fields:[],fieldsTitle:{}}
 * @returns Promise<IMarker | undefined>
 */
export async function getMarker(
  geojson: Feature.FeatureGeoJSON,
  fid: string,
  propertiesOption?: object
): Promise<IMarker | undefined> {
  if (!geojson || !geojson.features || !fid) return
  const feature = geojson.features.find(
    ({ properties }) => properties.fid === fid
  )
  if (!feature) return
  const img = await markerIconInstance.unSelectIcon()
  const coordinates = Feature.getGeoJSONFeatureCenter(feature)
  const { properties } = feature
  const markerProperties = {}
  if (
    propertiesOption &&
    Object.keys(propertiesOption).length > 0 &&
    propertiesOption.fields
  ) {
    const { fields, fieldsTitle } = propertiesOption
    if (fields && fields.length > 0) {
      const tempFields = [...fields]
      if (fieldsTitle && Object.keys(fieldsTitle).length > 0) {
        for (const key in fieldsTitle) {
          if (tempFields.includes(fieldsTitle[key])) {
            markerProperties[key] = properties[fieldsTitle[key]] || undefined
            const index = tempFields.indexOf(fieldsTitle[key])
            if (index > -1) {
              tempFields.splice(index, 1)
            }
          }
        }
      }
      for (let i = 0; i < tempFields.length; i++) {
        markerProperties[tempFields[i]] = properties[tempFields[i]] || undefined
      }
    }
  }
  return {
    img,
    feature,
    properties:
      Object.keys(markerProperties).length > 0 ? markerProperties : properties,
    coordinates,
    fid: properties.fid,
    markerId: UUID.uuid()
  }
}
