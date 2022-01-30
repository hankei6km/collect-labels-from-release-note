import * as core from '@actions/core'
import * as github from '@actions/github'
import { note } from './util'

try {
  const octkit = github.getOctokit(core.getInput('token'))
  const repository = core.getInput('repository')
  const repo = repository.split('/', 2)
  if (repo.length !== 2) {
    throw new Error(`repository: the input is invalid : ${repository}`)
  }
  const owner = repository[0]
  const name = repository[1]
  const tagName = core.getInput('tagName')
  console.log(owner, name, tagName)
  const html = note(octkit, owner, name, tagName)
  core.setOutput('labels', html)
} catch (err: any) {
  core.setFailed(err.message)
}
