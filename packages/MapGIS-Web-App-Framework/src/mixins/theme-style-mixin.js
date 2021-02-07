export default {
  props: {
    themeStyle: {
      type: Object,
      default() {
        return {
          theme: 'bg-accent text-white',
          color: 'blue-grey-11'
        }
      }
    }
  }
}
