import cache from 'memory-cache'

export namespace AppCache {
  export type ValidityCheck<T> = (value: T) => value is T

  export function put<T>(key: string, value: T, persist?: boolean) {
    cache.put(key, value)
    if (persist) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  export function get<T>(key: string, validityCheck?: ValidityCheck<T>): T | undefined {
    let cached = cache.get(key)
    if (cached) {
      return cached
    }
    let persistedCached = localStorage.getItem(key)
    if (persistedCached) {
      if (persistedCached === "undefined") {
        return undefined
      }
      let v = JSON.parse(persistedCached)
      if (validityCheck?.(v) === false) {
        console.log({ message: "not valid get", key: key, value: v })
        return undefined
      }
      cache.put(key, v)
      return v
    } else {
      return undefined
    }
  }

  export function getWithDefault<T>(key: string, defaultValue: T, validityCheck?: ValidityCheck<T>): T {
    let cached = cache.get(key)
    if (cached) {
      return cached
    }
    let persistedCached = localStorage.getItem(key)
    if (persistedCached) {
      if (persistedCached === "undefined") {
        //Data itself is undefined
        // @ts-ignore
        if (validityCheck?.(undefined) === false) {
          console.log({ message: "not valid get", key: key, value: undefined })
          // @ts-ignore
          return defaultValue
        }
        // @ts-ignore
        return defaultValue

      }
      let v = JSON.parse(persistedCached)
      if (validityCheck?.(v) === false) {
        console.log({ message: "not valid", key: key, value: v })
        return defaultValue
      }
      cache.put(key, v)
      return v
    } else {
      return defaultValue
    }
  }
}
