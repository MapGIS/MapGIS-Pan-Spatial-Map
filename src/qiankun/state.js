import store from '@/store'
import router from '@/router'
import storage from 'store'
import { ACCESS_TOKEN } from '@/store/mutation-types'

export function getProps() {
  return {
    data: {
      // eslint-disable-next-line no-undef
      publicPath: __webpack_public_path__,
      token: storage.get(ACCESS_TOKEN),
      store,
      router
    }
  }
}
