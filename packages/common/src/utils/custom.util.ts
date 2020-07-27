import deepmerge from 'deepmerge'
import objectPath from 'object-path-immutable'
import { getBorderCharacters, table } from 'table'

interface MergeObjectsOptions {
  array: 'overwrite' | 'merge'
}

/** Merge objects deep from overwriting the properties from source to target.
 * Does not mutate the object */
export function mergeObjects (target: Record<string, any>, source: Record<string, any>, options?: MergeObjectsOptions): Record<string, any> {
  // array strategy
  let arrayMergeStrategy: (destinationArray, sourceArray) => any[]
  if (options?.array === 'merge') {
    arrayMergeStrategy = (destinationArray, sourceArray): any[] => [ ...destinationArray, ...sourceArray ]
  } else {
    arrayMergeStrategy = (destinationArray, sourceArray): any[] => sourceArray
  }

  return deepmerge(target, source, { arrayMerge: arrayMergeStrategy })
}

/** For removing overlapping keys of the source from target. **/
export function removeObjectOverlappingKeys (target: Record<string, any>, source: Record<string, any>, deleteEmpty?: boolean, nullIt?: boolean): Record<string, any> {
  let newTarget = objectPath.assign({}, '', target)
  Object.keys(source).forEach((key) => {
    if (!Array.isArray(source[key]) && typeof source[key] === 'object') {
      // do nothing if else
      if (newTarget[key]) {
        // if the key is empty now, delete it whole together
        newTarget[key] = removeObjectOverlappingKeys(newTarget[key], source[key])

        // check for empty remaning object
        if (deleteEmpty !== false && Object.keys(newTarget[key]).length === 0) {
          newTarget = objectPath.del(newTarget, key)
        }
      }
    } else if (nullIt) {
      newTarget[key] = null
    } else {
      newTarget = objectPath.del(newTarget, key)
    }
  })

  return newTarget
}

/** For removing the non-overlapping keys. */
export function removeObjectOtherKeys (target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  let strippedObject = {}

  Object.keys(source).forEach((key) => {
    if (target?.[key] && !Array.isArray(target[key]) && typeof target[key] === 'object') {
      // if the key is empty now, delete it whole together
      strippedObject[key] = removeObjectOtherKeys(target[key], source[key])

      // check for empty remaning object
      if (Object.keys(strippedObject[key]).length === 0) {
        strippedObject = objectPath.del(strippedObject, key)
      }
    } else if (typeof target?.[key] !== 'undefined') {
      strippedObject[key] = target[key]
    }
  })

  return strippedObject
}

/** Draw a table to the CLI. */
export function createTable (headers: string[], data: string[][]): table {
  data.unshift(headers)

  data = data.map((row) =>
    row.reduce((o, column) => {
      return [ ...o, column.toString() ]
    }, [])
  )

  return table(data, { border: getBorderCharacters('norc') })
}

/** Checks wheter a object is iterable or not */
export function isIterable (obj: any): boolean {
  // checks for null and undefined
  if (obj == null) {
    return false
  }
  return typeof obj[Symbol.iterator] === 'function'
}
