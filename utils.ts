import set from 'lodash-es/set'
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
export const setProperty = set
