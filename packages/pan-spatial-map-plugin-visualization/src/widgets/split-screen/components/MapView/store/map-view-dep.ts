// 1.添加订阅者
// 2.存储状态
// 3.通知更新
interface DepInterface {
  new (subs: unknown[], state: Record<string, unknown>): Record<string, any>
}

class Dep {
  private subs: unknown[] = []

  private state: Record<string, unknown> = {
    selectedNodes: []
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

  addSub(sub: unknown) {
    this.subs.push(sub)
  }

  removeSub(sub: unknown) {
    this.subs.splice(this.subs.indexOf(sub), 1)
  }

  notify() {
    this.subs.forEach((sub: any) => {
      sub.update()
    })
  }
}

const dep = new Dep()

export default dep
