import { message } from 'antd'
import useSWR from 'swr'
import fetch from '../kit/fetch'
import { TConfig } from '../../types/shim'
import { useState } from 'react'
import { isFunction } from '../kit'
import { TAllConfig } from '@hlink/core'

type CallbackOption<T> = {
  onSuccess?: (data: T) => void
  onError?: (e: any) => void
}

type ConfigDetail = Omit<TAllConfig, 'withoutConfirm' | 'reverse'>

export function useAddOrEdit(options?: CallbackOption<boolean>) {
  const [currentConfigName, setEdit] = useState<string>()
  const [newConfig, addOrUpdateConfig] = useState<TConfig>()
  const addOrEditResult = useSWR(
    () => (newConfig ? ['/api/config', currentConfigName] : null),
    (url) => {
      const method = currentConfigName ? fetch.put : fetch.post
      const params = currentConfigName
        ? {
            preName: currentConfigName,
            ...newConfig,
          }
        : newConfig
      return method<boolean>(url, params)
    },
    {
      onError(e) {
        message.error(e.message)
        addOrUpdateConfig(undefined)
        if (isFunction(options?.onError)) {
          options?.onError(e)
        }
      },
      onSuccess(data) {
        addOrUpdateConfig(undefined)
        if (isFunction(options?.onSuccess)) {
          options?.onSuccess(data)
        }
      },
    }
  )
  return {
    addOrUpdateConfig: (newConfig: TConfig, currentConfigName?: string) => {
      setEdit(currentConfigName)
      addOrUpdateConfig(newConfig)
    },
    ...addOrEditResult,
  }
}

export function useList() {
  return useSWR('/api/config/list', (url) => fetch.get<TConfig[]>(url))
}

export function useGet(options?: CallbackOption<TConfig>) {
  const [item, getItem] = useState<string>()
  const result = useSWR(
    item ? '/api/config' : null,
    (url) => {
      return fetch.get<TConfig>(url, { name: item })
    },
    {
      onError(e) {
        getItem(undefined)
        message.error(e.message)
        if (isFunction(options?.onError)) {
          options?.onError(e)
        }
      },
      onSuccess(data) {
        if (isFunction(options?.onSuccess)) {
          if (item) {
            options?.onSuccess(data)
          }
        }
      },
    }
  )
  return {
    getItem,
    ...result,
  }
}

export function useGetDetail(options?: CallbackOption<ConfigDetail>) {
  const [item, getItem] = useState<string>()
  const result = useSWR(
    item ? '/api/config/detail' : null,
    (url) => {
      return fetch.get<ConfigDetail>(url, { name: item })
    },
    {
      onError(e) {
        message.error(e.message)
        getItem(undefined)
        if (isFunction(options?.onError)) {
          options?.onError(e)
        }
      },
      onSuccess(data) {
        getItem(undefined)
        if (isFunction(options?.onSuccess)) {
          if (item) {
            options?.onSuccess(data)
          }
        }
      },
    }
  )
  return {
    getItem,
    ...result,
  }
}

export function useDelete(options?: CallbackOption<boolean>) {
  const [name, rmItem] = useState<string>()
  const result = useSWR(
    name ? '/api/config' : null,
    (url) => {
      return fetch.delete<boolean>(url, { name })
    },
    {
      onError(e) {
        message.error(e.message)
        rmItem(undefined)
        if (isFunction(options?.onError)) {
          options?.onError(e)
        }
      },
      onSuccess(data) {
        rmItem(undefined)
        if (isFunction(options?.onSuccess)) {
          options?.onSuccess(data)
        }
      },
    }
  )
  return {
    rmItem,
    ...result,
  }
}
