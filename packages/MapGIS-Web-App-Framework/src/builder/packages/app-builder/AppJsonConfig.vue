<template>
  <div class="app-json-container antd-tab-pane">
    <json-editor ref="jsonEditor" :value="JSON.stringify(appConfig, null, 2)" />
  </div>
</template>

<script>
import JsonEditor from './ReadOnlyJsonEditer'

export default {
  name: 'AppJsonConfig',
  components: { JsonEditor },
  props: {
    appConfig: {
      type: Object
    }
  }
}
</script>

<style lang="less" scoped>
.app-json-container {
  position: relative;
  height: 100%;
}
</style>
