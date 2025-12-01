<template>
  <div v-if="loginExtendLinks && loginExtendLinks.length > 0">
    <a v-for="(loginExtendLink, index) in loginExtendLinks" :key="index" :href="loginExtendLink.url">
      {{ loginExtendLink.name }}
    </a>
  </div>
</template>

<script>
export default {
  name: 'CustomLogin',
  props: {
    loginExtendLinks: {
      type: Array,
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
