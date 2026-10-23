import { Button, Card, Input, Select, Space, Switch, Typography } from 'antd'
import type { TFileFilter, TFileRule } from '@hlink/core'

type Props = {
  value?: TFileFilter | null
  onChange?: (value: TFileFilter | null) => void
}

const types = [
  { value: 'keyword', label: '关键词列表' },
  { value: 'regex', label: '正则表达式' },
  { value: 'glob', label: '通配符 Glob' },
  { value: 'preset', label: '命名规则' },
]
const targets = [
  { value: 'filename', label: '文件名' },
  { value: 'parent', label: '父目录名' },
  { value: 'relativePath', label: '相对路径' },
]
const presets = [
  { value: 'jav', label: 'JAV 番号（IPZZ-037 / FC2-PPV 等）' },
  { value: 'episode', label: '季集编号（S01E02 / 1x02）' },
  { value: 'date', label: '日期（2026-10-23）' },
  { value: 'resolution', label: '分辨率（1080p / 4K 等）' },
]

export default function FileFilterEditor({ value, onChange }: Props) {
  const change = (patch: Partial<TFileFilter>) =>
    onChange?.({ ...value, ...patch })
  const updateRule = (
    group: 'rules' | 'exclude',
    index: number,
    patch: Partial<TFileRule>
  ) =>
    change({
      [group]: (value?.[group] || []).map((rule, i) =>
        i === index ? { ...rule, ...patch } : rule
      ),
    })
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space>
        <Switch
          checked={!!value}
          onChange={(enabled) =>
            onChange?.(enabled ? { mode: 'any', rules: [], exclude: [] } : null)
          }
        />
        <span>为此任务单独配置筛选规则</span>
      </Space>
      <Typography.Text type="secondary">
        {value
          ? '此处替代配置文件中的 fileFilter，并与原有 include/exclude 同时生效。未添加包含规则时，包含所有通过原有筛选的文件。'
          : '使用配置文件中的筛选规则；同一源目录可以创建多个任务，分别硬链到不同目标。'}
      </Typography.Text>
      {value && (
        <>
          <Space wrap>
            <span>包含规则之间</span>
            <Select
              aria-label="包含规则组合方式"
              value={value.mode || 'any'}
              style={{ width: 180 }}
              options={[
                { value: 'any', label: '满足任意一条' },
                { value: 'all', label: '必须满足全部' },
              ]}
              onChange={(mode) => change({ mode })}
            />
          </Space>
          {(['rules', 'exclude'] as const).map((group) => (
            <Card
              key={group}
              size="small"
              title={
                group === 'rules'
                  ? '包含规则'
                  : '排除规则（命中任意一条即排除）'
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {(value[group] || []).map((rule, index) => (
                  <Card key={index} size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space wrap>
                        <Select
                          aria-label="规则类型"
                          value={rule.type}
                          options={types}
                          style={{ width: 150 }}
                          onChange={(type) =>
                            updateRule(group, index, { type, values: [] })
                          }
                        />
                        <Select
                          aria-label="匹配范围"
                          value={rule.target || 'filename'}
                          options={targets}
                          style={{ width: 140 }}
                          onChange={(target) =>
                            updateRule(group, index, { target })
                          }
                        />
                        <Switch
                          checked={rule.caseSensitive || false}
                          checkedChildren="区分大小写"
                          unCheckedChildren="忽略大小写"
                          onChange={(caseSensitive) =>
                            updateRule(group, index, { caseSensitive })
                          }
                        />
                        <Button
                          danger
                          onClick={() =>
                            change({
                              [group]: value[group]?.filter(
                                (_, i) => i !== index
                              ),
                            })
                          }
                        >
                          删除规则
                        </Button>
                      </Space>
                      {rule.type === 'preset' ? (
                        <Select
                          aria-label="命名规则"
                          mode="multiple"
                          style={{ width: '100%' }}
                          value={rule.values}
                          options={presets}
                          placeholder="请选择命名规则"
                          onChange={(values) =>
                            updateRule(group, index, { values })
                          }
                        />
                      ) : (
                        <Input.TextArea
                          aria-label="匹配值列表"
                          autoSize={{ minRows: 2, maxRows: 8 }}
                          value={rule.values.join('\n')}
                          placeholder={
                            rule.type === 'keyword'
                              ? '每行一个关键词，可批量粘贴，例如：纪录片\nDocumentary'
                              : rule.type === 'regex'
                              ? '每行一个正则，直接填写表达式，例如：S\\d{2}E\\d{2}（无需 / /）'
                              : '每行一个 Glob，例如：**/*.mkv（目录规则请选相对路径）'
                          }
                          onChange={(event) =>
                            updateRule(group, index, {
                              values: event.target.value.split('\n'),
                            })
                          }
                          onBlur={() =>
                            updateRule(group, index, {
                              values: rule.values.filter((text) => text.trim()),
                            })
                          }
                        />
                      )}
                      <Typography.Text type="secondary">
                        同一条规则中的多个值，命中任意一个即满足。
                      </Typography.Text>
                    </Space>
                  </Card>
                ))}
                <Button
                  onClick={() =>
                    change({
                      [group]: [
                        ...(value[group] || []),
                        { type: 'keyword', values: [], target: 'filename' },
                      ],
                    })
                  }
                >
                  {group === 'rules' ? '添加包含规则' : '添加排除规则'}
                </Button>
              </Space>
            </Card>
          ))}
        </>
      )}
    </Space>
  )
}
