import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { useEffect, useRef } from 'react'
import defaultConfig from '../kit/defaultConfig'

type TProps = {
  value?: string
  onChange?: (v?: string) => void
  className?: string
  readOnly?: boolean
  type?: 'javascript' | 'json'
}

function Editor(props: TProps) {
  const {
    value,
    onChange,
    className,
    readOnly = false,
    type,
    ...otherProps
  } = props
  const monacoEl = useRef<HTMLDivElement>(null)
  let editor: monaco.editor.IStandaloneCodeEditor | null = null
  useEffect(() => {
    if (monacoEl.current) {
      const resultValue =
        type === 'json' && value
          ? JSON.stringify(JSON.parse(value), null, 2)
          : value || defaultConfig.get()
      editor = monaco.editor.create(monacoEl.current, {
        theme: 'vs-dark',
        value: resultValue,
        language: 'javascript',
        readOnly,
        lineNumbers: 'off',
      })
      onChange && onChange(resultValue)
      editor.onDidChangeModelContent(() => {
        if (typeof onChange === 'function') {
          onChange(editor?.getValue())
        }
      })
    }
    return () => {
      editor?.dispose()
    }
  }, [])

  return (
    <div
      ref={monacoEl}
      {...otherProps}
      className={`h-100% ${className || ''}`}
    ></div>
  )
}

export default Editor
