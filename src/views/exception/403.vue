<template>
  <mapgis-ui-result status="warning" :title="$t('exception.403')">
    <template #extra>
      <mapgis-ui-button type="primary" @click="toHome">{{ $t('back.home') }}</mapgis-ui-button>
    </template>
  </mapgis-ui-result>
</template>

<script>
export default {
  name: 'Exception403',
  methods: {
    toHome() {
      this.$router.push({ path: '/' })
    }
  }
}
</script>
