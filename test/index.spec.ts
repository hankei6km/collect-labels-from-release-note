import { fileURLToPath } from 'node:url'
import { jest } from '@jest/globals'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

// mock の作り方が不明なので、input の検証のみ.

// read-only property で戻せない。前は使えたと思ったのだが.
//const saveEnv = process.env
//beforeEach(() => (process.env = { ...saveEnv }))
//afterAll(() => (process.env = { ...saveEnv }))

const saveInputs = {
  token: process.env.INPUT_TOKEN,
  repository: process.env.INPUT_REPOSITORY,
  tagName: process.env['INPUT_TAG-NAME']
}
beforeEach(() => {
  process.env.INPUT_TOKEN = saveInputs.token
  process.env.INPUT_REPOSITORY = saveInputs.repository
  process.env['INPUT_TAG-NAME'] = saveInputs.tagName
})
afterAll(() => {
  process.env.INPUT_TOKEN = saveInputs.token
  process.env.INPUT_REPOSITORY = saveInputs.repository
  process.env['INPUT_TAG-NAME'] = saveInputs.tagName
})

describe('index', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const ip = path.join(__dirname, '..', 'dist', 'index.js')
  it('should print error message(reopsitory = undefined)', async () => {
    const [stdout, stderr] = await new Promise((resolve) => {
      cp.exec(`node ${ip}`, { env: process.env }, (_err, stdout, stderr) => {
        resolve([stdout.toString(), stderr.toString()])
      })
    })
    expect(stdout).toMatch(/\:\:error\:\:repository\: the input is invalid \:/)
    expect(stderr).toEqual('')
  })
  it('should print error message(reopsitory = owner)', async () => {
    process.env['INPUT_REPOSITORY'] = 'test-owner'
    const [stdout, stderr] = await new Promise((resolve) => {
      cp.exec(`node ${ip}`, { env: process.env }, (_err, stdout, stderr) => {
        resolve([stdout.toString(), stderr.toString()])
      })
    })
    expect(stdout).toMatch(
      /\:\:error\:\:repository\: the input is invalid \: test-owner/
    )
    expect(stderr).toEqual('')
  })
  it('should print error message(reopsitory = owner/name/foo)', async () => {
    process.env['INPUT_TOKEN'] = 'aaa'
    process.env['INPUT_REPOSITORY'] = 'test-owner/name/foo'
    const [stdout, stderr] = await new Promise((resolve) => {
      cp.exec(`node ${ip}`, { env: process.env }, (_err, stdout, stderr) => {
        resolve([stdout.toString(), stderr.toString()])
      })
    })
    expect(stdout).toMatch(
      /\:\:error\:\:repository\: the input is invalid \: test-owner\/name\/foo/
    )
    expect(stderr).toEqual('')
  })
})
