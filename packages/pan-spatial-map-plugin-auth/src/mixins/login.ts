import { Store } from 'vuex'
import { Vue, Component } from 'vue-property-decorator'
import qs from 'qs'
import { userLogin } from '../api/users'

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
        const { data } = await userLogin(
          qs.stringify({ userName: username, password })
        )
        if (data.code === 0) return data.data.NickName
        throw Error(data.errorMessage)
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
}
