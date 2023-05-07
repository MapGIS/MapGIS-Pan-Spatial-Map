<template>
  <a-config-provider :locale="locale">
    <div id="main-app">
      <router-view v-if="initialized" />
    </div>
  </a-config-provider>
</template>

<script>
import { setDocumentTitle, setFavicon } from '@/utils/domUtil'
import { i18nRender } from '@/locales'
import { serverMixin } from '@/store/server-mixin'
import { mapGetters } from 'vuex'

export default {
  mixins: [serverMixin],
  data() {
    return {
      initialized: false
    }
  },
  computed: {
    ...mapGetters(['domTitle']),
    locale() {
      // 只是为了切换语言时，更新标题
      const { title } = this.$route.meta
      title && setDocumentTitle(`${i18nRender(title)} - ${this.domTitle}`)

      return this.$i18n.getLocaleMessage(this.$store.getters.lang).antLocale
    }
  },
  async mounted() {
    await this.$store.dispatch('getSystemConfig')
    await this.$store.dispatch('getBaseConfig')
    this.initialized = true
    if (this.baseConfig.logo) {
      if (this.baseConfig.logo.indexOf('<svg') >= 0) {
        setFavicon('data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(this.baseConfig.logo))))
      } else {
        setFavicon(this.baseConfig.logo)
      }
    }
  },
  destroyed() {}
}
</script>
