<template>
  <a-result status="500" title="500" :sub-title="$t('exception.500')">
    <template #extra>
      <a-button type="primary" @click="toHome">{{ $t('back.home') }}</a-button>
    </template>
  </a-result>
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
