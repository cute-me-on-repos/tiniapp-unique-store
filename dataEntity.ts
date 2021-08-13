import { EventEmitter, IEventListener } from './eventEmitter'

export class DataEntity extends EventEmitter {
  private _data: any
  onChangeEvent: Symbol
  constructor(obj: any = { entityName: 'DataEntity' }) {
    super()
    Object.assign(this, obj)
    this._data = obj?.data || {}
    this.onChangeEvent = Symbol('onChange')
  }

  get data() {
    return this._data
  }

  set data(data) {
    this._data = data
    // console.log(`entity "${this.entityName}" changed::`, data);
    this.emit(this.onChangeEvent, { value: data, path: '' })
  }

  onChange(fn: IEventListener) {
    return super.on(this.onChangeEvent, fn)
  }
  onChangeOnce(fn: IEventListener) {
    return super.once(this.onChangeEvent, fn)
  }
}
