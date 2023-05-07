<template>
  <a v-if="config.enabled && config.isReserveDefaultLogin" :href="config.casLoginUrl">
    {{ $t('user.login.cas.login') }}
  </a>
</template>

<script>
export default {
  name: 'CasLogin',
  props: {
    config: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="less" scoped>
.user-login-other {
  a {
    margin-left: 16px;
  }
}
</style>
