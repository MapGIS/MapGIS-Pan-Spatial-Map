import MapRender, {
  default2DMapRender,
  default3DMapRender
} from '../utils/map-render'

export default {
  inject: ['getApplication', 'getDesignTime'],
  data() {
    return {
      mapboxRender: MapRender.MAPBOXGL,
      cesiumRender: MapRender.CESIUM
    }
  },
  computed: {
    application() {
      return this.getApplication()
    },
    designTime() {
      return this.getDesignTime()
    },
    theme() {
      return this.application.theme
    },
    document: {
      get() {
        return this.application.document
      },
      set(doc) {
        this.application.document = doc
      }
    },
    baseUrl() {
      return this.application.baseAPI === '/' ? '' : this.application.baseAPI
    },
    appConfigUrl() {
      return `${this.application.baseAPI}${this.application.appConfigPath}`
    },
    appAssetsUrl() {
      return `${this.application.baseAPI}${this.application.appAssetsPath}`
    },
    appLogo() {
      if (this.application.logo.indexOf('<svg') >= 0) {
        return this.application.logo
      }
      return `${this.appAssetsUrl}${this.application.logo}`
    },
    mapRender: {
      get() {
        const { maprender = default2DMapRender } = this.document

        return maprender
      },
      set(render) {
        if (this.document.maprender !== render) {
          this.document.maprender = render
          this.onMapModeChanged()
        }
      }
    },
    is2DMapMode() {
      switch (this.mapRender.toLowerCase()) {
        case MapRender.CESIUM:
          return false
        default:
          return true
      }
    }
  },
  methods: {
    mergeProps(...args) {
      let props = {}
      args.forEach(arg => {
        props = { ...props, ...arg }
      })
      return props
    },
    switchMapMode() {
      this.mapRender = this.is2DMapMode
        ? default3DMapRender
        : default2DMapRender
    },
    onMapModeChanged() {}
  }
}
