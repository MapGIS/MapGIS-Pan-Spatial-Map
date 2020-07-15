export class MapContainer {
  public containers: any[]

  public registers: any[][]

  constructor() {
    this.containers = []
    this.registers = []
  }

  public get count() {
    return this.containers.length
  }

  public add(options: any) {
    this.containers.push(options)
    this.registers
      .filter(x => x[0] === 'onMapLoad')
      .forEach(x => x[1](options.map))
  }

  public clear(map: any) {
    this.registers.filter(x => x[0] === 'onMapClear').forEach(x => x[1](map))
  }

  public registerEvent(eventName: string, callback: Function) {
    this.registers.push([eventName, callback])
  }
}

const mapContainerInstance: MapContainer = new MapContainer()

export default mapContainerInstance
