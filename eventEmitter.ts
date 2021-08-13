/**
 *
 * @class EventEmitter
 * @source https://gist.github.com/kylepillay/32c99b09a15b4ab26bb8cfd1e86c3a56#file-eventemitter-js
 *
 */
export interface IEventListener<T = any> {
  (this: ThisType<any>, ...data: T[]): void
}
export class EventEmitter {
  private readonly _events: Record<any, Set<IEventListener>> = {}
  constructor() {}

  _getEventListByName(eventName: any) {
    if (!this._events[eventName]) {
      this._events[eventName] = new Set()
    }
    return this._events[eventName]
  }

  on(eventName: any, listener: IEventListener) {
    this._getEventListByName(eventName).add(listener)
  }

  once(eventName: any, listener: IEventListener) {
    const self = this

    const onceFn = function (...args: any[]) {
      self.removeListener(eventName, onceFn)
      listener.apply(self, args)
    }

    this.on(eventName, onceFn)
  }

  emit(eventName: any, ...args: any[]) {
    this._getEventListByName(eventName).forEach(
      function (fn: IEventListener) {
        // @ts-ignore
        fn.apply(this, args)
      }.bind(this),
    )
  }

  removeListener(eventName: any, fn: IEventListener) {
    this._getEventListByName(eventName).delete(fn)
  }
}
