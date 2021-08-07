import Vue from 'vue'
import MpPortal from './Portal.vue'

let zIndex = 0

MpPortal.newInstance = (properties = {}, container) => {
  const instance = new Vue({
    name: `Portal${zIndex++}`,
    data: {
      ...properties,
      visible: false
    },
    methods: {
      remove() {
        setTimeout(() => {
          this.destroy()
        }, 300)
      },
      destroy() {
        this.$destroy()
        this.onRemove()
      },
      onRemove() {}
    },
    render() {
      const { scopedSlots, ...props } = this.$props
      return <MpPortal {...{ props }} scopedSlots={scopedSlots} />
    }
  }).$mount()

  const getParent = container => {
    let _container = document.body
    switch (typeof container) {
      case 'string':
        _container = document.querySelectorAll(container)[0]
        break
      case 'function':
        _container = container()
        break
      case 'object':
        if (container instanceof window.HTMLElement) {
          _container = container
        }
        break
      default:
        break
    }
    return _container
  }

  getParent(container).appendChild(instance.$el)

  const component = instance.$children[0]

  return {
    show(props) {
      instance.visible = true
      for (const key in props) {
        component.$parent[key] = props[key]
      }
    },
    remove() {
      instance.visible = false
      instance.remove()
    },
    component
  }
}

export default MpPortal
