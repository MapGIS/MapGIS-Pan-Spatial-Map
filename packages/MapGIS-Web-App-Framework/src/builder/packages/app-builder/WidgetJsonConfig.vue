<template>
  <div class="widget-json-container">
    <json-editor v-model="config" />
  </div>
</template>

<script>
import JsonEditor from './JsonEditer.vue'
import WidgetSettingMixin from './mixins/widget-setting-mixin'

export default {
  name: 'AppJsonConfig',
  components: { JsonEditor },
  mixins: [WidgetSettingMixin],
  watch: {
    widgetConfig() {
      this.config = this.widgetConfig
    }
  }
}
</script>

<style lang="less" scoped>
.widget-json-container {
  position: relative;
  height: 100%;
}
</style>
