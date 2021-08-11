import { Unsubscribe } from 'redux'
import diff from './diff'
import handleMapDispatch from './mapDispatch'
import handleMapState from './mapState'
import { getProvider } from './provider'
import subscription from './subscription'
import { ConnectOption, IAnyArray, IAnyObject, PageComponentOption } from './types'
import { getKeys, setProperty as set, warn } from './utils'

declare const Page: (options: PageComponentOption) => void
declare const Component: (options: PageComponentOption) => void

const INSTANCE_ID = Symbol('INSTANCE_ID')

interface This extends PageComponentOption {
  [INSTANCE_ID]: symbol
}

export default function connect({
  type = 'page',
  mapState,
  mapDispatch,
  manual = false,
}: ConnectOption = {}): (options: PageComponentOption) => void | PageComponentOption {
  if (type !== 'page' && type !== 'component') {
    warn('The type attribute can only be `Page` or `Component`')
  }

  const isPage = type === 'page'
  const { lifetimes, namespace } = getProvider()

  return function processOption(options: PageComponentOption): PageComponentOption | void {
    if (Array.isArray(mapState) && mapState.length > 0) {
      const ownState = handleMapState(mapState)
      options.data = Object.assign(
        options.data || {},
        namespace ? { [namespace]: ownState } : ownState,
      )

      const unsubscribeMap = new Map<symbol, Unsubscribe>()

      const [onLoadKey, onUnloadKey] = lifetimes[type]
      const oldOnLoad = <Function | undefined>options[onLoadKey]
      const oldOnUnload = <Function | undefined>options[onUnloadKey]

      options[onLoadKey] = function (this: This, ...args: IAnyArray): void {
        const getData = (): IAnyObject =>
          namespace ? <IAnyObject>this.data![namespace] : this.data!

        const ownState = handleMapState(mapState)
        const diffData = diff(ownState, getData(), namespace)
        if (getKeys(diffData).length > 0) {
          const newData = Object.assign({}, getData())
          Object.keys(diffData).forEach((key) => {
            set(newData, key, diffData[key])
          })
          this.setData(newData)
        }
        const id = Symbol('instanceId')
        const unsubscribe = subscription(
          { id, data: getData(), setData: this.setData.bind(this) },
          mapState,
        )
        unsubscribeMap.set(id, unsubscribe)
        this[INSTANCE_ID] = id

        if (oldOnLoad) {
          oldOnLoad.apply(this, args)
        }
      }

      options[onUnloadKey] = function (this: This): void {
        if (oldOnUnload) {
          oldOnUnload.apply(this)
        }

        const id = this[INSTANCE_ID]
        if (unsubscribeMap.has(id)) {
          const unsubscribe = unsubscribeMap.get(id)!
          unsubscribeMap.delete(id)
          unsubscribe()
        }
      }
    }

    if (mapDispatch) {
      const target = isPage ? options : (options.methods = options.methods || {})
      handleMapDispatch(mapDispatch, target)
    }

    return manual ? options : isPage ? Page(options) : Component(options)
  }
}

export class Connector {
  constructor(
    public type: Pick<ConnectOption, 'type'> = 'page' as Pick<ConnectOption, 'type'>,
    public mapState: Pick<ConnectOption, 'mapState'> = [] as Pick<ConnectOption, 'mapState'>,
    public mapDispatch: Pick<ConnectOption, 'mapDispatch'> = {} as Pick<
      ConnectOption,
      'mapDispatch'
    >,
    public manual: Pick<ConnectOption, 'manual'> = true as Pick<ConnectOption, 'manual'>,
  ) {}
  setType(type: Pick<ConnectOption, 'type'>): Connector {
    this.type = type
    return this
  }
  setMapState(mapState: Pick<ConnectOption, 'mapState'>): Connector {
    this.mapState = mapState
    return this
  }
  setMapDispatch(mapDispatch: Pick<ConnectOption, 'mapDispatch'>): Connector {
    this.mapDispatch = mapDispatch
    return this
  }
  setManual(manual: Pick<ConnectOption, 'manual'>): Connector {
    this.manual = manual
    return this
  }
}
