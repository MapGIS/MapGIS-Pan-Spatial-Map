import Vue from 'vue'

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

const newInstance = ({ scopedSlots, ...props } = {}, container, component) => {
  const instance = new Vue({
    name: 'MpPortal',
    data: {
      ...props
    },
    methods: {
      remove() {
        setTimeout(() => {
          this.destroy()
        }, 300)
      },
      destroy() {
        this.$destroy()
        try {
          getParent(container).removeChild(this.$el)
        } catch (e) {}
      }
    },
    render(h) {
      return h(component, {
        props: {
          ...props
        },
        scopedSlots
      })
    }
  }).$mount()

  getParent(container).appendChild(instance.$el)

  const childComponent = instance.$children[0]

  return {
    show(props) {
      childComponent.visible = true
      for (const key in props) {
        childComponent.$parent[key] = props[key]
      }
      return instance
    },
    remove() {
      childComponent.visible = false
      if (childComponent.$parent) {
        childComponent.$parent.remove()
      }
    },
    component: childComponent
  }
}

export default newInstance
