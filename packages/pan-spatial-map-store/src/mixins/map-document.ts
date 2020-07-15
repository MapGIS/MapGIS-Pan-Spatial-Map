import { Vue, Component } from 'vue-property-decorator'
import mapDocumentInstance, { MapDocument } from '../map/map-document'
import mapContainerInstance, { MapContainer } from '../map/map-container'
import mapStateInstance, { MapState } from '../map/map-state'
import systemConfigInstance from '../config/system'

@Component({})
export default class MapDocumentMixin extends Vue {
  private mapContainer: MapContainer = mapContainerInstance

  private mapDocument: MapDocument = mapDocumentInstance

  private mapState: MapState = mapStateInstance

  public get document() {
    return this.mapDocument.document
  }

  /**
   * 修改document
   * @param document
   */
  public set document(document: any) {
    this.mapDocument.document = document
  }

  public get initZoom() {
    return this.mapState.initZoom
  }

  public set initZoom(zoom: number) {
    this.mapState.initZoom = zoom
  }

  public get initCenter() {
    return this.mapState.initCenter
  }

  public set initCenter(center: { lng; lat }) {
    this.mapState.initCenter = center
  }

  created() {
    const { onMapLoad } = this as any
    if (onMapLoad) {
      this.travelMap(onMapLoad)
      this.mapContainer.registerEvent('onMapLoad', onMapLoad)
    }

    const { onMapClear } = this as any
    if (onMapClear) {
      this.mapContainer.registerEvent('onMapClear', onMapClear)
    }
  }

  protected clear(map: any) {
    this.mapContainer.clear(map)
  }

  protected registerMap({ map, mapLib }: any) {
    const id = Math.random().toString()
    if (this.mapContainer.count === 0) {
      const self = this
      // 第一个地图加载的时候初始化
      MapDocument.init().then(() => {
        self.initZoom = systemConfigInstance.config.initZoom
        if (systemConfigInstance.config.center) {
          const lnglat = systemConfigInstance.config.center.split(',')
          self.initCenter = {
            lng: Number(lnglat[0]),
            lat: Number(lnglat[1])
          }
        }
      })
    }
    this.mapContainer.add({ map, mapLib, id })
    return id
  }

  protected get map(): any | undefined {
    if (this.mapContainer.count > 0) {
      return this.mapContainer.containers[0].map
    }
    return undefined
  }

  protected travelMap(func: Function) {
    return this.mapContainer.containers.map(({ map }) => {
      return func(map)
    })
  }

  protected get mapLib() {
    if (this.mapContainer.count > 0) {
      return this.mapContainer.containers[0].mapLib
    }
    return undefined
  }

  protected travelMapBox(func: Function) {
    return this.mapContainer.containers.map(({ mapLib }) => {
      return func(mapLib)
    })
  }

  protected removeMap(id: string) {
    if (this.mapContainer.count > 0) {
      const index = this.mapContainer.containers.findIndex(x => x.id === id)
      this.mapContainer.containers.splice(index, 1)
    }
  }
}
