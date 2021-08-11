import { IAnyObject } from './types'

export const isFunction = (value: unknown): value is Function => typeof value === 'function'

const _toString = Object.prototype.toString

export const isPlainObject = <T extends IAnyObject = IAnyObject>(value: unknown): value is T =>
  _toString.call(value) === '[object Object]'

export const getType = (value: unknown): string => _toString.call(value)

export const getKeys = Object.keys

export const { hasOwnProperty } = Object.prototype

export const warn = (message: string): never => {
  throw new Error(message)
}

/**
 *
 * @see https://stackoverflow.com/questions/54733539/javascript-implementation-of-lodash-set-method
 *
 */
export const setProperty = (obj: any, path: string | (string | number)[], value: any) => {
  if (Object(obj) !== obj) return obj // When obj is not an object
  // If not yet an array, get the keys from the string-path
  if (!Array.isArray(path)) path = ((path as unknown) as []).toString().match(/[^.[\]]+/g) || []
  path.slice(0, -1).reduce(
    (
      a,
      c,
      i, // Iterate all of them except the last one
    ) =>
      Object(a[c]) === a[c] // Does the key exist and is its value an object?
        ? // Yes: then follow that path
          a[c]
        : // No: create the key. Is the next key a potential array-index?
          (a[c] =
            Math.abs(path[i + 1] as number) >> 0 === +path[i + 1]
              ? [] // Yes: assign a new array object
              : {}), // No: assign a new plain object
    obj,
  )[path[path.length - 1]] = value // Finally assign the value to the last key
  return obj // Return the top-level object to allow chaining
}
