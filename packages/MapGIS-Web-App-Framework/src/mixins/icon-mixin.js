export default {
  computed: {
    getIconImg() {
      return function(icon_string, name_prop = 'name') {
        const props = {}

        if (icon_string.indexOf('<svg') === -1) {
          props[name_prop] = `img:${icon_string}`
        }

        return props
      }
    },
    getIconSvg() {
      return function(icon_string) {
        if (icon_string.indexOf('<svg') >= 0) {
          return icon_string
        }

        return ''
      }
    }
  }
}
