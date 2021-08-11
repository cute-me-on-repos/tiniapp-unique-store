import diff from './diff'
import { getProvider } from './provider'
import { Context, IAnyObject, QueueItem } from './types'
import { getKeys, setProperty as set } from './utils'

const queue: QueueItem[] = []

export function batchUpdate({ id, data, setData }: Context, updater: IAnyObject): void {
  const queueItem = queue.find((q) => q.id === id)
  if (queueItem) {
    // Merge multiple updates
    Object.assign(queueItem.updater, updater)
  } else {
    /**
     * Perform a shallow copy storage of the initial value as the original comparison object for subsequent diff execution
     * Mainly in order to prevent the reference type data from being modified by a page (component) by executing setData, the diff result of the remaining page (component) is wrong.
     */
    queue.push({ id, rootPath: getProvider().namespace, data: { ...data }, updater, setData })
  }

  // Synchronous update data
  Object.assign(data, updater)
  // Update the view asynchronously
  Promise.resolve().then(update)
}

function update(): void {
  if (queue.length < 1) return

  let queueItem: QueueItem | undefined
  while ((queueItem = queue.shift())) {
    const diffData = diff(queueItem.updater, queueItem.data, queueItem.rootPath)
    if (getKeys(diffData).length > 0) {
      Object.keys(diffData).forEach((key) => {
        if (queueItem !== undefined) set(queueItem.updater, key, diffData[key])
      })
      queueItem.setData({ ...queueItem.updater })
    }
  }
}
