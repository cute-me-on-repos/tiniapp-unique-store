import { Unsubscribe } from 'redux'
import { batchUpdate } from './batchUpdate'
import { useSubscribe } from './hooks'
import { Context, IAnyObject, MapState } from './types'
import { getKeys, isPlainObject } from './utils'

export default function subscription(context: Context, mapState: MapState): Unsubscribe {
  return useSubscribe((currState, prevState) => {
    const ownStateChanges: IAnyObject = {}
    for (let i = 0, len = mapState.length; i < len; i++) {
      const curr = mapState[i]
      switch (typeof curr) {
        case 'string': {
          if (currState[curr] !== prevState[curr]) {
            ownStateChanges[curr] = currState[curr]
          }
          break
        }
        case 'function': {
          const funcResult = curr(currState)
          if (isPlainObject(funcResult)) {
            Object.assign(ownStateChanges, funcResult)
          }
          break
        }
      }
    }
    if (getKeys(ownStateChanges).length > 0) {
      batchUpdate(context, ownStateChanges)
    }
  })
}
