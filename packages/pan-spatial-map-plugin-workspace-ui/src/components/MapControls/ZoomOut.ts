import { Mixins, Component } from 'vue-property-decorator'
import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpZoomOut'
})
export default class MpZoomOut extends Mixins(MapDocumentMixin) {
  render(h: Function) {
    return h()
  }

  click() {
    this.map.zoomOut()
  }
}
