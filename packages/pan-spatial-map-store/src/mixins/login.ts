import { Store } from 'vuex'
import { Vue, Component } from 'vue-property-decorator'
import * as api from '../api'

@Component({})
export default class LoginMixin extends Vue {
  public readonly $store!: Store<unknown>

  public async checkLogin(options: Record<string, string>) {
    let { login } = this as any

    // 如果目标组件不存在login方法则采用默认方法
    if (typeof login !== 'function') {
      login = async (info: Record<string, string>) => {
        const { username, password } = info
        if (!username) throw Error('username is empty')
        if (!password) throw Error('password is empty')
        return api.login({ username, password })
      }
    }

    try {
      // 提交action
      const flag = await this.$store.dispatch('user/login', () =>
        login(options)
      )
      return flag
    } catch (error) {
      return false
    }
  }

  public async doLogout() {
    let { logout } = this as any

    // logout
    if (typeof logout !== 'function') {
      logout = async () => {
        await api.logout()
        return true
      }
    }

    try {
      // 提交action
      const flag = await this.$store.dispatch('user/logout', () => logout())
      return flag
    } catch (error) {
      return false
    }
  }
}
