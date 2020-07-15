import { Mixins, Component } from 'vue-property-decorator'
import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpMapClear'
})
export default class MpMapClear extends Mixins(MapDocumentMixin) {
  render(h: Function) {
    return h()
  }

  click() {
    this.clear(this.map)
  }
}
