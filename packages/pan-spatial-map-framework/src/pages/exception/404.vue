<template>
  <exception-page home-route="/" style="min-height: 100vh" type="404" />
</template>

<script>
import ExceptionPage from '@/components/exception/ExceptionPage'
import { mapState } from 'vuex'

export default {
  name: 'Exp404',
  components: { ExceptionPage }
}
</script>

<style scoped lang="less"></style>
