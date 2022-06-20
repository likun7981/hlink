import { message } from 'antd'
import useSWR from 'swr'
import fetch from '../kit/fetch'
import { TConfig, TListItem } from '../../types/shim'

type TAddOrEditOption = {
  newConfig?: TConfig
  currentConfig?: TListItem
  onSuccess?: (data: boolean) => void
  onError?: (e: any) => void
}

export function useAddOrEdit(options: TAddOrEditOption) {
  const { newConfig, currentConfig, onError } = options
  return useSWR(
    () => (newConfig ? ['/api/config', currentConfig] : null),
    (url) => {
      const method = currentConfig ? fetch.put : fetch.post
      const params = currentConfig
        ? {
            preName: currentConfig.name,
            preDescription: currentConfig.description,
            ...newConfig,
          }
        : newConfig
      return method<boolean>(url, params)
    },
    {
      onError(e) {
        message.error(e.message)
        if (typeof onError === 'function') {
          onError(e)
        }
      },
    }
  )
}

export function useList() {
  return useSWR('/api/config/list', (url) => fetch.get<TListItem[]>(url), {
    suspense: true,
  })
}

type TGetOption = {
  params?: TListItem
  onSuccess?: (data: string) => void
  onError?: (e: any) => void
}

export function useGet(getOption: TGetOption) {
  const { params, onError } = getOption
  return useSWR(
    params ? '/api/config' : null,
    (url) => {
      return fetch.get<string>(url, params)
    },
    {
      dedupingInterval: 1000,
      onError(e) {
        message.error(e.message)
        if (typeof onError === 'function') {
          onError(e)
        }
      },
    }
  )
}
