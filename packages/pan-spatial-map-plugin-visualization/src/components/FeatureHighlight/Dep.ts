// 1.添加订阅者
// 2.存储状态
// 3.通知更新
import _cloneDeep from 'lodash/cloneDeep'

interface DepInterface {
  new (subs: unknown[], state: Record<string, unknown>): Record<string, any>
}

export class Dep {
  private subs: unknown[] = []

  private initState: Record<string, unknown> = {}

  private state: Record<string, unknown> = {}

  constructor(state = {}) {
    this.initState = state
    this.state = _cloneDeep(state)
  }

  setState(state) {
    switch (typeof state) {
      case 'function':
        this.state = state(this.state)
        break
      case 'object':
        this.state = { ...this.state, ...state }
        break
      default:
        this.state = state
        break
    }
  }

  getState() {
    return this.state
  }

  resetState() {
    this.state = _cloneDeep(this.initState)
  }

  addSub(sub: Vue) {
    this.subs.push(sub)
  }

  removeSub(sub: Vue) {
    this.subs.splice(this.subs.indexOf(sub), 1)
    sub.destroy && sub.destroy()
  }

  notify() {
    this.subs.forEach((sub: any) => {
      sub.update()
    })
  }
}

const dep = new Dep()

export default dep
