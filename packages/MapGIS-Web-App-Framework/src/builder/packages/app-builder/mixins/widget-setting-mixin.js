export default {
  props: {
    widgetConfig: {
      type: [Object, Array]
    }
  },
  data() {
    return {
      config: this.widgetConfig
    }
  },
  methods: {
    getConfig() {
      return this.config
    }
  }
}
