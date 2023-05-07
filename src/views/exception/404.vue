<template>
  <mapgis-ui-result status="404" title="404" :sub-title="$t('exception.404')">
    <template #extra>
      <mapgis-ui-button type="primary" @click="toHome">{{ $t('back.home') }}</mapgis-ui-button>
    </template>
  </mapgis-ui-result>
</template>

<script>
export default {
  name: 'Exception404',
  methods: {
    toHome() {
      this.$router.push({ path: '/' })
    }
  }
}
</script>
