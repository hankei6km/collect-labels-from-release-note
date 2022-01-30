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
  const owner = repo[0]
  const name = repo[1]
  const tagName = core.getInput('tag-name')
  console.log(owner, name, tagName)
  const html = await note(octkit, owner, name, tagName)
  console.log(html)
  core.setOutput('labels', html)
} catch (err: any) {
  core.setFailed(err.message)
}
