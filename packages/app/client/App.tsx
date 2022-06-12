import React, { useState } from 'react'
import { Layout, Button, Space, Drawer } from 'antd'
import Config from './components/Config'
import ConfigList from './components/ConfigList'
import Editor from './components/Editor'
import { TConfig } from '../types/shim'

const { Header, Footer, Content } = Layout

function App() {
  const [showConfig, setVisible] = useState(false)
  const [edit, setEdit] = useState<TConfig>()
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
          <ConfigList
            data={[
              {
                name: '配置1',
                description: '这个配置是给动漫用的',
                detail: 'export default { a: 1 }',
              },
            ]}
            onEditor={(editConfig) => {
              setEdit(editConfig)
              setVisible(true)
            }}
          />
        </div>
      </Content>
      <Footer className="text-center">
        MIT Licensed | Copyright © 2019-present likun & hlink Contributors
      </Footer>
      <Config
        key={Date.now()}
        visible={showConfig}
        onClose={() => {
          setVisible(false)
        }}
        data={edit}
        onSubmit={() => {
          setVisible(false)
        }}
      />
    </Layout>
  )
}

export default App
