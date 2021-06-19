const MapRender = {
  CESIUM: 'cesium',
  MAPBOXGL: 'mapboxgl',
  LEAFLET: 'leaflet',
  OPENLAYERS: 'openlayers'
}

export const default2DMapRender = MapRender.MAPBOXGL
export const default3DMapRender = MapRender.CESIUM
export default MapRender
