<template>
  <div></div>
</template>

<script>
import { WidgetInfoMixin } from '../../mixins'
import MapWidgetIcon from './MapWidgetIcon.vue'
import MapWidgetPlaceholder from './MapWidgetPlaceholder.vue'

export default {
  name: 'MpMapWidgetContainer',
  components: { MapWidgetIcon, MapWidgetPlaceholder },
  mixins: [WidgetInfoMixin],
  methods: {
    $_move() {}
  }
}
</script>

<style lang="less" scoped></style>
