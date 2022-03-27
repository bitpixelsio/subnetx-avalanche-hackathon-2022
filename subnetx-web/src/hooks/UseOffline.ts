import {useEffect, useState} from 'react';


export function useOffline(): boolean {
  const [offline, setOffline] = useState<boolean>(typeof window === "undefined" ? false : !window.navigator.onLine);

  useEffect(() => {
    if (typeof window === "undefined")
      return

    function onlineHandler() {
      setOffline(false)
    }

    function offlineHandler() {
      setOffline(true)
    }

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    return () => {
      window.removeEventListener("online", onlineHandler)
      window.removeEventListener("offline", offlineHandler)
    }
  }, [])

  return offline
}
