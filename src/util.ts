import * as github from '@actions/github'
import { Repository } from '@octokit/graphql-schema'
import parse5 from 'parse5'
import { fromParse5 } from 'hast-util-from-parse5'
import { Node } from 'unist'
import { Element } from 'hast'
import { visit } from 'unist-util-visit'

export async function note(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  name: string,
  tagName: string
): Promise<string> {
  const { repository } = await octokit.graphql<{ repository: Repository }>(
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
  if (repository && repository.release && repository.release.descriptionHTML) {
    return repository.release.descriptionHTML
  }
  throw new Error('note: "descriptionHTML" is not included in response')
}

function isElement(node: Node): node is Element {
  return node.type === 'element'
}

const pullsNumRegExp = /^[0-9]+$/
export function pulls(html: string, owner: string, name: string): number[] {
  const ret = new Set<number>([])
  const p5ast = parse5.parseFragment(String(html), {
    sourceCodeLocationInfo: true
  })
  const n: Node = fromParse5(p5ast)
  visit(n, (node: Node) => {
    // visitTest にはわけない,
    if (
      isElement(node) &&
      node.tagName === 'a' &&
      typeof node.properties?.href === 'string'
    ) {
      const a = node.properties.href.split('/')
      if (a[3] === owner && a[4] === name && a[6].match(pullsNumRegExp)) {
        ret.add(Number.parseInt(a[6], 10))
      }
    }
  })
  return [...ret]
}

export async function labels(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  prs: number[]
): Promise<string[]> {
  let ret: string[] = []
  for (let pr of prs) {
    const { data: pullRequest } = await octokit.rest.pulls
      .get({
        owner,
        repo,
        pull_number: pr,
        mediaType: {
          format: 'json'
        }
      })
      .catch((err) => {
        throw new Error('labels: error occuered in call api')
      })
    ret = ret.concat(
      ...pullRequest.labels
        .map(({ name }) => name)
        .filter((value): value is string => typeof value === 'string') // string のみ.
        .filter((value) => value) // '' 以外.
    )
  }
  return [...new Set<string>(ret)]
}
