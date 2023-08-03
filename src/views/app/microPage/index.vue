<template>
  <div>
    <div id="micro-page" v-show="mounting"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import microAppRegister from '@/qiankun'

export default {
  name: 'MicroPage',
  computed: {
    ...mapState({
      mounting: state => state.microApps.mounting
    })
  },
  mounted() {
    microAppRegister(this)
  }
}
</script>

<style lang="less" scoped></style>
