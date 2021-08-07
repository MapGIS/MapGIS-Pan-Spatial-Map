import MpPortal from './instance'

class Portal {
  portalInstance = null

  getInstance(props, container) {
    if (!this.portalInstance) {
      this.portalInstance = MpPortal.newInstance(props, container)
    }
    return this.portalInstance
  }

  show(props, container) {
    const instance = this.getInstance(props, container)
    if (props.onRemove) {
      instance.remove()
    }

    instance.show(props)

    return instance
  }

  hide() {
    if (this.portalInstance) {
      this.portalInstance.remove()
      this.portalInstance = null
    }
  }
}

const portalInstance = new Portal()

export default portalInstance
