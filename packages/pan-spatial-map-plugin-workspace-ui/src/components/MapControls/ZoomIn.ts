import { Mixins, Component } from 'vue-property-decorator'
import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpZoomIn'
})
export default class MpZoomIn extends Mixins(MapDocumentMixin) {
  render(h: Function) {
    return h()
  }

  click() {
    this.map.zoomIn()
  }
}
