import MpSpin from '../spin/Spin'
import newInstance from './instance'

class Portal {
  instance = null

  getInstance(props, container, component) {
    if (!this.instance) {
      this.instance = newInstance(props, container, component)
    }
    return this.instance
  }

  show(props, container, component = MpSpin) {
    const _instance = this.getInstance(props, container, component)

    return _instance.show(props)
  }

  remove() {
    if (this.instance) {
      this.instance.remove()
      this.instance = null
    }
  }
}

const instance = new Portal()

export default instance
