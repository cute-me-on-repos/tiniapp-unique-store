import { DataEntity } from 'dataEntity'
import { Store } from 'redux'

export function createSimpleStore(
  metaDataToStore: Record<string, any>,
  dataEntity: DataEntity,
): Store {
  const entity: any = (dataEntity as unknown) as any

  entity.getState = function () {
    return entity.data
  }
  entity.subscribe = function (listener: (data: any) => void) {
    return entity.onChange(listener)
  }
  entity.dispatch = function (action: Record<string, any>) {
    console.error('dispatch here with action', action)
    entity.data = {
      ...entity.data,
      ...action.payload,
    }
    return entity.data
  }
  return ({
    ...metaDataToStore,
  } as unknown) as Store
}
