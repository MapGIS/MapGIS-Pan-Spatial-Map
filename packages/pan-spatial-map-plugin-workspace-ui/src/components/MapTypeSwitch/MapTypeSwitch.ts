import { Mixins, Component } from 'vue-property-decorator'
import { MapTypeChanageMixin } from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpMapTypeSwitch'
})
export default class MpMapTypeSwitch extends Mixins(MapTypeChanageMixin) {
  render(h: Function) {
    return h()
  }

  click() {
    if (this.mapType === 'cesium') {
      this.changeMapType('mapbox')
    } else {
      this.changeMapType('cesium')
    }
  }
}
