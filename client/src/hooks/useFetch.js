import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../api/http'

// Runs an async request and tracks { data, loading, error } for the UI.
// `deps` works like useEffect's list: the request re-runs when they change.
export default function useFetch(request, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true // ignore results that arrive after the page changed
    setLoading(true)
    setError(null)
    request()
      .then((result) => active && setData(result))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])
  return { data, loading, error, reload, setData }
}
