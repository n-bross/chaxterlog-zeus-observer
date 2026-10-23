const { readFileSync } = require('node:fs')
const { join } = require('node:path')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const { test } = require('node:test')
const ts = require('typescript')
const compile = (file) => ts.transpileModule(readFileSync(join(__dirname, '..', file), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

test('login, observation and export store only the limited receipt data', async () => {
  const storage = new Map(), clipboard = []
  const normalized = { exports: {} }
  vm.runInNewContext(compile('observer.ts'), normalized)
  let handler, disposed = false, requests = 0
  const record = { kind: 'result', button: 'Kommt/Geht', at: new Date().toISOString(), tapAt: new Date().toISOString(), result: { text: 'Kommt 15:30 Saldo -2.53', fields: [] } }
  const context = vm.createContext({
    exports: {}, require: (id) => id === './observer' ? normalized.exports : { Script: { exit() {} } },
    Storage: { get: (key) => storage.get(key), set: (key, value) => storage.set(key, value), remove: (key) => storage.delete(key) },
    Pasteboard: { setString: async (value) => clipboard.push(value) },
    Dialog: { actionSheet: async () => 0, alert: async () => {} },
    WebViewController: class {
      async addScriptMessageHandler(_name, callback) { handler = callback }
      async loadURL(url) { assert.ok(url.startsWith('https://zeiterfassung.grafing.de/')); requests++; return true }
      async evaluateJavaScript(source) { assert.equal(source, normalized.exports.OBSERVER_SCRIPT) }
      async present() { handler({ ...record, password: 'do-not-store' }) }
      dispose() { disposed = true }
    },
    setInterval: () => 1, clearInterval() {},
  })
  vm.runInContext(compile('index.tsx').replace(/main\(\)\.catch\([\s\S]*$/, ''), context)
  await vm.runInContext('main()', context)
  assert.equal(requests, 1)
  assert.equal(disposed, true)
  assert.equal(storage.get('zeus-observer.records.v1').length, 1)
  assert.equal(clipboard.length, 1)
  assert.equal(clipboard[0].includes('do-not-store'), false)
  assert.equal(JSON.parse(clipboard[0]).records[0].result.text, record.result.text)
})
