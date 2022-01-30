import * as core from '@actions/core'
import * as github from '@actions/github'
import { labels, note, pulls } from './util'

try {
  const octkit = github.getOctokit(core.getInput('token'))
  const repository = core.getInput('repository')
  const repo = repository.split('/')
  if (repo.length !== 2) {
    throw new Error(`repository: the input is invalid : ${repository}`)
  }
  const owner = repo[0]
  const name = repo[1]
  const tagName = core.getInput('tag_name')
  const l = await labels(
    octkit,
    owner,
    name,
    pulls(await note(octkit, owner, name, tagName), owner, name)
  )
  core.setOutput('labels', JSON.stringify(l))
} catch (err: any) {
  core.setFailed(err.message)
}
