<template>
  <a-result status="warning" :title="$t('exception.403')">
    <template #extra>
      <a-button type="primary" @click="toHome">{{ $t('back.home') }}</a-button>
    </template>
  </a-result>
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
