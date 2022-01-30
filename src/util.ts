import * as github from '@actions/github'

export async function note(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  name: string,
  tagName: string
): Promise<string> {
  return await octokit.graphql(
    `
query ($owner: String!, $name: String!, $tagName: String!) {
  repository(owner:$owner, name:$name) {
    release(tagName:$tagName){
      descriptionHTML
    }
  }
}
`,
    { owner, name, tagName }
  )
}

export async function labels(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  pr: number
): Promise<string[]> {
  const { data: pullRequest } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pr,
    mediaType: {
      format: 'json'
    }
  })
  return pullRequest.labels
    .map(({ name }) => name)
    .filter((value): value is string => typeof value === 'string') // string のみ.
    .filter((value) => value) // '' 以外.
}
