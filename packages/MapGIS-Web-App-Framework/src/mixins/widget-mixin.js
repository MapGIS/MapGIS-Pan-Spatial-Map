import WidgetInfoMixin from './widget-info-mixin'
import MapMixin from './map-mixin'
import WidgetState from '../utils/widget-state'

export default {
  mixins: [WidgetInfoMixin, MapMixin],
  watch: {
    'widget.state': {
      handler(newState, oldState) {
        if (
          oldState === WidgetState.OPENED &&
          newState === WidgetState.ACTIVE
        ) {
          this.onActive()
        } else if (
          oldState === WidgetState.ACTIVE &&
          newState === WidgetState.OPENED
        ) {
          this.onDeActive()
        }
        if (
          oldState === WidgetState.CLOSED &&
          newState === WidgetState.OPENED
        ) {
          this.onOpen()
        } else if (newState === WidgetState.CLOSED) {
          this.onClose()
        }

        this.$emit('update-widget-state', {
          widget: this.widget,
          newState,
          oldState
        })

        // console.log(`${this.widget.uri} ${oldState} -> ${newState}`)
      }
    }
  },
  methods: {
    onOpen() {},
    onClose() {},
    onActive() {},
    onDeActive() {}
  }
}
