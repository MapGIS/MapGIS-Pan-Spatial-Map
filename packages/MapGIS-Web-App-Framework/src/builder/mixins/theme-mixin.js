import AppMixin from './app-mixin'

export default {
  provide() {
    const self = this
    return {
      get mapbox() {
        return self.mapbox
      },
      get map() {
        return self.map
      },
      get actions() {
        return self.actions
      },
      get webGlobe() {
        return self.webGlobe
      },
      get Cesium() {
        return self.Cesium
      },
      get CesiumZondy() {
        return self.CesiumZondy
      }
    }
  },
  mixins: [AppMixin],
  data() {
    return {
      map: {},
      mapbox: {},
      webGlobe: {},
      Cesium: {},
      CesiumZondy: {},
      actions: {},
      mapboxInitialized: false,
      cesiumInitialized: false,
      mapInitialized: false,
      refSuffix: 'Content'
    }
  },
  created() {
    this.$root.$on('mapbox-load', this.onMapboxLoadInTheme.bind(this))
    this.$root.$on('cesium-load', this.onCesiumLoadInTheme.bind(this))
  },
  methods: {
    onMapboxLoadInTheme({ map, mapbox, actions }) {
      this.map = map
      this.mapbox = mapbox
      this.actions = actions
      this.mapboxInitialized = true
      if (this.cesiumInitialized) {
        this.mapInitialized = true
      }
    },
    onCesiumLoadInTheme({ webGlobe, Cesium, CesiumZondy }) {
      this.webGlobe = webGlobe
      this.Cesium = Cesium
      this.CesiumZondy = CesiumZondy
      this.cesiumInitialized = true
      if (this.mapboxInitialized) {
        this.mapInitialized = true
      }
    },
    onUpdateWidgetState(contentName, e) {
      const contentComponent = this.$refs[`${contentName}${this.refSuffix}`]
      if (contentComponent) contentComponent.onUpdateWidgetState(e)
    },
    parseContentComponent(contentName) {
      const content = this.getContent(contentName)

      if (content) {
        return content.component
      }

      return undefined
    },
    parseContentProps(contentName) {
      const content = this.getContent(contentName)
      let props = {
        mapInitialized: this.mapInitialized,
        ...this.$props[contentName]
      }

      if (content) {
        props = this.mergeProps(props, content)
      }

      return props
    },
    getContent(contentName) {
      if (this.theme && this.theme.manifest && this.theme.manifest.contents) {
        const content = this.theme.manifest.contents.find(
          c => c.name === contentName
        )

        if (content) return content
      }

      return undefined
    }
  }
}