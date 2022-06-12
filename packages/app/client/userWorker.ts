import * as monaco from 'monaco-editor'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
  },
}

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
