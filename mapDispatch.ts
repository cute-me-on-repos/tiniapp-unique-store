import { useDispatch } from './hooks'
import { IAnyArray, IAnyObject, MapDispatch, MapDispatchFunction, MapDispatchObject } from './types'
import { getKeys, isFunction, isPlainObject, warn } from './utils'

function handleMapDispatchObject(mapDispatch: MapDispatchObject, target: IAnyObject): void {
  const dispatch = useDispatch()
  const keys = getKeys(mapDispatch)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    const actionCreator = mapDispatch[key]
    if (isFunction(actionCreator)) {
      target[key] = (...args: IAnyArray) => dispatch(actionCreator.apply(null, args))
    }
  }
}

function handleMapDispatchFunction(mapDispatch: MapDispatchFunction, target: IAnyObject): void {
  const boundActionCreators = mapDispatch(useDispatch())
  if (!isPlainObject(boundActionCreators)) {
    warn('mapDispatch must return an object')
  }
  Object.assign(target, boundActionCreators)
}

export default function handleMapDispatch(mapDispatch: MapDispatch, target: IAnyObject): void {
  if (isPlainObject(mapDispatch)) {
    handleMapDispatchObject(mapDispatch, target)
  } else if (isFunction(mapDispatch)) {
    handleMapDispatchFunction(mapDispatch, target)
  }
}
