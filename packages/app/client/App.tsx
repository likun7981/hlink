import React, { Suspense, useState } from 'react'
import { Layout, Button, message } from 'antd'
import Config from './components/Config'
import ConfigList from './components/ConfigList'
import useSWR from 'swr'
import fetch from './kit/fetch'
import { TConfig } from '../types/shim'
import defaultConfig from './kit/defaultConfig'

const { Header, Footer, Content } = Layout

function App() {
  const [showConfig, setVisible] = useState(false)
  const [edit, setEdit] = useState<TConfig>()
  const [config, setConfig] = useState<TConfig>()
  const [getParam, setGetParam] = useState<Omit<TConfig, 'detail'>>()
  useSWR('/api/config/default', (url) => fetch.get<string>(url), {
    suspense: true,
    onSuccess(data) {
      defaultConfig.set(data)
    },
  })

  useSWR(
    () => (config ? ['/api/config', edit] : null),
    (url) => {
      const method = edit ? fetch.put : fetch.post
      const params = edit
        ? { preName: edit.name, preDescription: edit.description, ...config }
        : config
      return method<boolean>(url, params)
    },
    {
      onSuccess() {
        setConfig(undefined)
        setVisible(false)
      },
      onError(e) {
        setConfig(undefined)
        message.error(e.message)
      },
    }
  )
  useSWR(
    () => (getParam ? ['/api/config', edit] : null),
    (url) => {
      return fetch.get<string>(url, getParam)
    },
    {
      onSuccess(data) {
        if (getParam) {
          const edit: TConfig = {
            detail: data,
            name: getParam?.name,
            description: getParam?.description,
          }
          setGetParam(undefined)
          setVisible(true)
          setEdit(edit)
        }
      },
      onError(e) {
        setGetParam(undefined)
        message.error(e.message)
      },
    }
  )

  return (
    <Layout className="h-screen">
      <Header className="flex justify-between items-center">
        <a
          href="https://hlink.likun.me"
          className="color-white text-size-5 font-600 flex items-center justify-center"
        >
          <img
            className="h-1.3rem mr-3"
            src="https://hlink.likun.me/logo.svg"
          />
          hlink
        </a>
        <Button
          onClick={() => {
            setEdit(undefined)
            setVisible(true)
          }}
          type="link"
        >
          创建配置
        </Button>
      </Header>
      <Content className="flex justify-center">
        <div className="w-80% m-2">
          <Suspense fallback={<>加载中...</>}>
            <ConfigList
              onEditor={(editConfig) => {
                setGetParam(editConfig)
              }}
            />
          </Suspense>
        </div>
      </Content>
      <Footer className="text-center">
        MIT Licensed | Copyright © 2019-present likun & hlink Contributors
      </Footer>
      {showConfig && (
        <Config
          visible
          onClose={() => {
            setVisible(false)
          }}
          data={edit}
          onSubmit={(v) => {
            console.log(v)
            setConfig(v)
          }}
        />
      )}
    </Layout>
  )
}

export default App
