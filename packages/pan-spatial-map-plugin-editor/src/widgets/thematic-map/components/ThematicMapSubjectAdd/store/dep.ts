class Dep {
  constructor(private subs: Vue[] = []) {
    this.subs = subs
  }

  getSub() {
    return [...this.subs]
  }

  addSub(sub: Vue) {
    this.subs.push(sub)
  }

  removeSub(sub: Vue) {
    this.subs.splice(this.subs.indexOf(sub), 1)
  }
}

const dep = new Dep()

export default dep
