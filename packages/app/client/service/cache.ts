import useSWR from 'swr'
import fetch from '../kit/fetch'

export function useGet() {
  return useSWR('/api/cache', (url) => fetch.get<string>(url))
}
