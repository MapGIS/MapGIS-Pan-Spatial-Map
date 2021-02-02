<template>
  <page-toggle-transition
    :disabled="animate.disabled"
    :animate="animate.name"
    :direction="animate.direction"
  >
    <router-view />
  </page-toggle-transition>
</template>

<script>
import { mapState } from 'vuex'
import PageToggleTransition from '../components/transition/PageToggleTransition'

export default {
  name: 'BlankView',
  components: { PageToggleTransition },
  computed: {
    ...mapState('setting', ['multiPage', 'animate'])
  }
}
</script>

<style scoped></style>
