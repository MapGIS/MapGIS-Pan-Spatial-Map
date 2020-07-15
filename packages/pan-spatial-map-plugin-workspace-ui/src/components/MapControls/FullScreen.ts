import { Mixins, Component } from 'vue-property-decorator'
import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpFullScreen'
})
export default class MpFullScreen extends Mixins(MapDocumentMixin) {
  render(h: Function) {
    return h()
  }

  click() {
    this.$q.fullscreen.toggle()
  }
}
