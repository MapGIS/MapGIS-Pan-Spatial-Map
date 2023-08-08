import store from '@/store'
import router from '@/router'
import storage from 'store'
import { ACCESS_TOKEN } from '@/store/mutation-types'

export function getProps() {
  return {
    data: {
      publicPath: process.env.BASE_URL,
      token: storage.get(ACCESS_TOKEN),
      store,
      router
    }
  }
}
