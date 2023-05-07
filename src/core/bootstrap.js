import store from '@/store'
import storage from 'store'
import { ACCESS_TOKEN, APP_LANGUAGE } from '@/store/mutation-types'

export default function Initializer() {
  store.commit('SET_TOKEN', storage.get(ACCESS_TOKEN))

  store.dispatch('setLang', storage.get(APP_LANGUAGE, 'zh-CN'))
  // last step
}
