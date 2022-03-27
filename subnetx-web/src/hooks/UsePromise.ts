import { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { useOffline } from "./UseOffline";
import { AppCache } from "../utils/AppCache";

export function usePromise<I extends any[], R>(
  promise: (...inputs: I) => Promise<R>,
  config: { refresh?: number, cache?: { cacheKey: string, isCachePersistent?: boolean, validityCheck?: AppCache.ValidityCheck<R>, skipIfOnCache?: boolean }, skip?: boolean },
  ...inputs: I): [R | undefined, boolean] {
  const [response, setResponse] = useState<R | undefined>(config.cache ? AppCache.get(config.cache.cacheKey, config.cache.validityCheck) : undefined)
  const [inProgress, setInProgress] = useState(true)
  const previousInputs = useRef<I>(inputs)
  const isOffline = useOffline()

  let currentInputs: I
  if (_.isEqual(previousInputs.current, inputs)) {
    currentInputs = previousInputs.current
  } else {
    currentInputs = inputs
    previousInputs.current = inputs
  }

  useEffect(() => {
    if (config.cache?.skipIfOnCache && response !== undefined) {
      return
    }
    if (config.skip) {
      return
    }
    if (isOffline) {
      return
    }
    let isCancelled = false

    setInProgress(true)
    promise(...currentInputs).then(value => {
      if (isCancelled) {
        return
      }
      setResponse(prevValue => {
        if (_.isEqual(prevValue, value)) {
          return prevValue
        } else {
          return value
        }
      })
      if (config.cache?.cacheKey) {
        AppCache.put(config.cache.cacheKey, value, config.cache.isCachePersistent)
      }
    }).catch(_ => {
      if (isCancelled) {
        return
      }
    }).then(() => {
      if (isCancelled) {
        return
      }
      setInProgress(false)
    })

    return () => {
      isCancelled = true
    }
  }, [currentInputs, promise, isOffline, config.refresh, config.skip, config.cache?.cacheKey, config.cache?.isCachePersistent, config.cache?.skipIfOnCache])

  return [response, inProgress]
}
