import { message } from 'antd'
import useSWR from 'swr'
import fetch from '../kit/fetch'
import { TTask } from '../../types/shim'
import { useState } from 'react'
import { isFunction } from '../kit'

type CallbackOption<T> = {
  onSuccess?: (data: T) => void
  onError?: (e: any) => void
}

export function useAddOrEdit(options?: CallbackOption<boolean>) {
  const [currentTask, setEdit] = useState<string>()
  const [newTask, addOrUpdateTask] = useState<TTask>()
  const addOrEditResult = useSWR(
    () => (newTask ? ['/api/task', currentTask] : null),
    (url) => {
      const method = currentTask ? fetch.put : fetch.post
      const params = currentTask
        ? {
            preName: currentTask,
            ...newTask,
          }
        : newTask
      return method<boolean>(url, params)
    },
    {
      onError(e) {
        message.error(e.message)
        addOrUpdateTask(undefined)
        if (isFunction(options?.onError)) {
          options?.onError(e)
        }
      },
      onSuccess(data) {
        addOrUpdateTask(undefined)
        if (isFunction(options?.onSuccess)) {
          options?.onSuccess(data)
        }
      },
    }
  )
  return {
    addOrUpdateTask: (newTask: TTask, currentTask?: string) => {
      setEdit(currentTask)
      addOrUpdateTask(newTask)
    },
    ...addOrEditResult,
  }
}

export function useList() {
  return useSWR('/api/task/list', (url) => fetch.get<TTask[]>(url), {
    suspense: true,
  })
}

export function useGet(options?: CallbackOption<TTask>) {
  const [name, getItem] = useState<string>()
  const result = useSWR(
    name ? '/api/task' : null,
    (url) => {
      return fetch.get<TTask>(url, { name })
    },
    {
      onError(e) {
        message.error(e.message)
        if (isFunction(options?.onError)) {
          options?.onError(e)
        }
      },
      onSuccess(data) {
        getItem(undefined)
        if (isFunction(options?.onSuccess)) {
          options?.onSuccess(data)
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
    name ? '/api/task' : null,
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
