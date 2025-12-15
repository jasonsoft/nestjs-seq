import { isPlainObject } from './shared.util';
import { logToConsole } from './log-console.util';

/**
 * Performs a shallow clone of the given object or array.
 *
 * Added by Jason.Song (成长的小猪) on 2025/08/07 01:01:30
 * @param {T} source The source object or array to clone.
 * @returns {T} A shallow copy of the source.
 */
export function shallowClone<T>(source: T): T {
  if (source === null || typeof source !== 'object') {
    return source;
  }

  if (Array.isArray(source)) {
    return [...source] as T;
  }

  if (source instanceof Date) {
    return new Date(source.getTime()) as T;
  }

  if (source instanceof RegExp) {
    return new RegExp(source.source, source.flags) as T;
  }

  if (source instanceof Map) {
    return new Map(source) as T;
  }

  if (source instanceof Set) {
    return new Set(source) as T;
  }

  return { ...source } as T;
}

/**
 * Performs a deep clone of the given object or array.
 * Handles circular references by maintaining a WeakMap of already cloned objects.
 *
 * Added by Jason.Song (成长的小猪) on 2025/08/07 01:01:12
 * @param {T} source The source object or array to clone.
 * @param {WeakMap<object, any>} cloneMap Internal map to track cloned objects (for circular reference handling).
 * @returns {T} A deep copy of the source.
 */
export function deepClone<T>(
  source: T,
  cloneMap: WeakMap<object, any> = new WeakMap(),
): T {
  // Handle primitive types and null
  if (source === null || typeof source !== 'object') {
    return source;
  }

  // Handle circular references
  if (cloneMap.has(source as object)) {
    return cloneMap.get(source as object);
  }

  // Handle Date objects
  if (source instanceof Date) {
    const cloned = new Date(source.getTime()) as T;
    cloneMap.set(source as object, cloned);
    return cloned;
  }

  // Handle RegExp objects
  if (source instanceof RegExp) {
    const cloned = new RegExp(source.source, source.flags) as T;
    cloneMap.set(source as object, cloned);
    return cloned;
  }

  // Handle Arrays
  if (Array.isArray(source)) {
    const cloned: any[] = [];
    cloneMap.set(source as object, cloned);

    for (let i = 0; i < source.length; i++) {
      cloned[i] = deepClone(source[i], cloneMap);
    }

    return cloned as T;
  }

  // Handle Map objects
  if (source instanceof Map) {
    const cloned = new Map();
    cloneMap.set(source as object, cloned);

    for (const [key, value] of source) {
      cloned.set(deepClone(key, cloneMap), deepClone(value, cloneMap));
    }

    return cloned as T;
  }

  // Handle Set objects
  if (source instanceof Set) {
    const cloned = new Set();
    cloneMap.set(source as object, cloned);

    for (const value of source) {
      cloned.add(deepClone(value, cloneMap));
    }

    return cloned as T;
  }

  // Handle Buffer objects (Node.js specific)
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(source)) {
    const cloned = Buffer.from(source) as T;
    cloneMap.set(source as object, cloned);
    return cloned;
  }

  // Handle plain objects
  if (isPlainObject(source)) {
    const cloned: any = {};
    cloneMap.set(source as object, cloned);

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        cloned[key] = deepClone((source as any)[key], cloneMap);
      }
    }

    return cloned as T;
  }

  // Handle other object types by attempting to clone their enumerable properties
  try {
    const cloned = Object.create(Object.getPrototypeOf(source));
    cloneMap.set(source as object, cloned);

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        cloned[key] = deepClone((source as any)[key], cloneMap);
      }
    }

    return cloned as T;
  } catch (error) {
    // If cloning fails, return the original object
    return source;
  }
}

/**
 * Generic clone function that performs deep cloning by default.
 *
 * Added by Jason.Song (成长的小猪) on 2025/08/07 01:00:49
 * @param {T} source The source object or array to clone.
 * @param {boolean} deep Whether to perform deep cloning (default: true).
 * @returns {T} A copy of the source.
 */
export function clone<T>(source: T, deep: boolean = true): T {
  return deep ? deepClone(source) : shallowClone(source);
}

/**
 * Safely clones an object with error handling.
 * Returns the original object if cloning fails.
 *
 * Added by Jason.Song (成长的小猪) on 2025/08/07 01:49:43
 * @param {T} source The source object to clone.
 * @param {boolean} deep Whether to perform deep cloning (default: true).
 * @returns {T} A copy of the source or the original if cloning fails.
 */
export function safeClone<T>(source: T, deep: boolean = true): T {
  try {
    return clone(source, deep);
  } catch (error: any) {
    logToConsole(
      'warn',
      `Clone operation failed, returning original object: ${error.message}`,
      error.stack,
    );
    return source;
  }
}
