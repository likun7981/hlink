import queryString from 'query-string'

type TAllowMethods = 'get' | 'post' | 'put' | 'delete'

type ResponseType<T> = {
  success: boolean
  errorMessage?: string
  data?: T
}

type TFetch = <T>(url: string, params?: Record<string, any>) => Promise<T>

const allowMethods: TAllowMethods[] = ['get', 'delete', 'post', 'put']

const fetch = allowMethods.reduce((result, method) => {
  result[method] = async <T>(url: string, params?: Record<string, any>) => {
    const fetchOption: RequestInit = {
      method,
      headers: {
        'content-type': 'application/json',
      },
    }
    if ((method === 'get' || method === 'delete') && params) {
      url += `?${queryString.stringify(params)}`
    } else {
      fetchOption.body = JSON.stringify(params)
    }
    const result = (await window
      .fetch(url, fetchOption)
      .then((resp) => resp.json())) as ResponseType<T>

    if (result.success) {
      return result.data!
    }
    throw new Error(result.errorMessage)
  }
  return result
  // @ts-ignore
}, {} as Record<TAllowMethods, TFetch>)

export default fetch
