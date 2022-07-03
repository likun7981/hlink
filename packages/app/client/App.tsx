import React, { useState } from 'react'
import { Layout, Row, Col, Button } from 'antd'
import ConfigList from './components/ConfigList'
import useSWR from 'swr'
import fetch from './kit/fetch'
import defaultConfig from './kit/defaultConfig'
import './index.less'
import TaskList from './components/TaskList'
import logo from './logo.svg'
import CacheEditor from './components/CacheEditor'

const { Header, Footer, Content } = Layout

function App() {
  useSWR('/api/config/default', (url) => fetch.get<string>(url), {
    suspense: true,
    onSuccess(data) {
      defaultConfig.set(data)
    },
  })
  const [visible, setVisible] = useState(false)

  return (
    <>
      <Layout className="h-screen">
        <Header className="flex justify-between items-center">
          <a
            href="https://hlink.likun.me"
            className="color-white text-size-5 font-600 flex items-center justify-center"
          >
            <img className="h-1.3rem mr-3" src={logo} />
            hlink
          </a>
          <Button type="link" onClick={() => setVisible(true)}>
            编辑缓存
          </Button>
        </Header>
        <Content className="flex justify-center overflow-auto">
          <Row className="w-80% m-2" gutter={[6, 6]}>
            <Col span={24}>
              <TaskList />
            </Col>
            <Col span={24}>
              <ConfigList />
            </Col>
          </Row>
        </Content>
        <Footer className="text-center border-t border-#eee">
          MIT Licensed | Copyright © 2019-present likun & hlink Contributors
        </Footer>
      </Layout>
      <CacheEditor visible={visible} onClose={() => setVisible(false)} />
    </>
  )
}

export default App
