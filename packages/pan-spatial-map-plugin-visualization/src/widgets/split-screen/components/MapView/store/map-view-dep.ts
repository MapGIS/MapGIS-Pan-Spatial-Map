// 1.添加订阅者
// 2.存储状态
// 3.通知更新
import _cloneDeep from 'lodash/cloneDeep'

class Dep {
  static target?

  private subs: Vue[] = []

  private initState: object = {}

  private state: object = {}

  constructor(state = {}) {
    this.initState = state
    this.state = _cloneDeep(this.initState)
  }

  getState() {
    return this.state
  }

  resetState(): void {
    this.state = _cloneDeep(this.initState)
  }

  setState(stateOrFn: Function | object): void {
    switch (typeof stateOrFn) {
      case 'function':
        this.state = stateOrFn(this.state)
        break
      case 'object':
        this.state = {
          ...this.state,
          ...stateOrFn
        }
        break
      default:
        break
    }
  }

  addSub(sub: Vue): void {
    this.subs.push(sub)
  }

  removeSub(sub: Vue): void {
    this.subs.splice(this.subs.indexOf(sub), 1)
    sub.destroy && sub.destroy()
  }

  notify(): void {
    this.subs.forEach((sub: Vue) => {
      sub.update()
    })
  }
}

Dep.target = null

const depStack = []

const pushTarget = (dep: Dep) => {
  depStack.push()
  Dep.target = dep
}

const popTarget = () => {
  depStack.pop()
  Dep.target = null
}

const dep = new Dep()

export { Dep }

export default dep
