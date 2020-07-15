export class BaseEvent {
  private registers: Map<symbol, Map<string, Function>>

  constructor() {
    this.registers = new Map()
  }

  public registerEvent(id: symbol, eventName: string, callback: Function) {
    let map = this.registers.get(id)
    if (!map) {
      map = new Map()
      this.registers.set(id, map)
    }
    map.set(eventName, callback)
  }

  public invokeEvent(eventName: string, ...args: unknown[]) {
    const promises: Promise<unknown>[] = []
    this.registers.forEach(map => {
      const callback = map.get(eventName)
      if (typeof callback === 'function') {
        promises.push(callback(...args))
      }
    })
    return Promise.all(promises)
  }

  public unRegisterEvent(id: symbol) {
    return this.registers.delete(id)
  }
}
