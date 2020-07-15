import { Vue, Component } from 'vue-property-decorator'
import mapTypeChangeInstance, { MapTypeChange } from '../map/map-type-change'

@Component({})
export default class MapTypeChanageMixin extends Vue {
  private mapTypeChange: MapTypeChange = mapTypeChangeInstance

  private mapTypeChangeId = Symbol('MapTypeChange')

  private mapTypeChangeEventType = 'onMapTypeChange'

  public get mapType() {
    return this.mapTypeChange.mapType
  }

  public set mapType(mapType: string) {
    this.mapTypeChange.mapType = mapType
  }

  public get isPlaneMode() {
    switch (this.mapType.toLowerCase()) {
      case 'mapbox':
        return true
      case 'cesium':
        return false
      default:
        return undefined
    }
  }

  protected created() {
    this.registerMapTypeChange()
  }

  protected beforeDestroy() {
    this.unRegisterMapTypeChange()
  }

  protected changeMapType(mapType: string) {
    this.mapTypeChange.mapType = mapType
    this.mapTypeChange.invokeEvent(
      this.mapTypeChangeEventType,
      this.isPlaneMode,
      mapType
    )
  }

  private registerMapTypeChange() {
    this.mapTypeChange.registerEvent(
      this.mapTypeChangeId,
      this.mapTypeChangeEventType,
      (this as any).onMapTypeChange
    )
  }

  private unRegisterMapTypeChange() {
    this.mapTypeChange.unRegisterEvent(this.mapTypeChangeId)
  }
}
