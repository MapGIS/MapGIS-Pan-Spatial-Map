<template>
  <mapgis-ui-result status="500" title="500" :sub-title="$t('exception.500')">
    <template #extra>
      <mapgis-ui-button type="primary" @click="toHome">{{ $t('back.home') }}</mapgis-ui-button>
    </template>
  </mapgis-ui-result>
</template>

<script>
export default {
  name: 'Exception500',
  methods: {
    toHome() {
      this.$router.push({ path: '/' })
    }
  }
}
</script>
