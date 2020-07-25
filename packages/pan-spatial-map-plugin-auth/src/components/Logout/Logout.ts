import { Mixins, Component } from 'vue-property-decorator'
import { LoginMixin } from '../../mixins'

@Component({
  name: 'MpLogout'
})
export default class MpLogout extends Mixins(LoginMixin) {
  render(h: Function) {
    return h()
  }

  async click() {
    const flag = await this.doLogout()

    if (flag) {
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    } else {
      this.$q.notify({
        position: 'center',
        message: '退出失败'
      })
    }
  }
}
