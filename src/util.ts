import * as github from '@actions/github'
import { Repository } from '@octokit/graphql-schema'
import parse5 from 'parse5'
import { fromParse5 } from 'hast-util-from-parse5'
import { Node } from 'unist'
import { Element } from 'hast'
import { visit } from 'unist-util-visit'
import {
  chainSignal,
  Chan,
  ChanRecv,
  ChanSend,
  emptyPromise,
  workers
} from 'chanpuru'

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

async function labelsFromPR(
  signal: AbortSignal,
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  pr: number
): Promise<string[]> {
  return octokit.rest.pulls
    .get({
      owner,
      repo,
      pull_number: pr,
      mediaType: {
        format: 'json'
      },
      request: {
        signal
      }
    })
    .then(
      ({ data }) =>
        data.labels
          .map(({ name }) => name)
          .filter((value): value is string => typeof value === 'string') // string のみ.
          .filter((value) => value) // '' 以外.
    )
}

const workerNum = 3
function pullRequesets(
  [cancelPromise, cancel]: [Promise<void>, () => void],
  sendErr: ChanSend<any>,
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  prs: number[]
): ChanRecv<string[]> {
  const ch = new Chan<() => Promise<string[]>>()
  ;(async () => {
    const [chainedPromise, signal] = chainSignal(cancelPromise)
    // 今回は reject にされることはない.
    // chainedPromise.catch(() => {})
    for (const pr of prs) {
      if (signal.aborted) {
        break
      }
      await ch.send(() =>
        labelsFromPR(signal, octokit, owner, repo, pr).catch((err) => {
          sendErr(new Error(`labels: error occuered in call api: ${err}`))
          cancel()
          return Promise.reject(err) // reciver に到達させないため(worker 内で reject させる).
        })
      )
    }
    ch.close()
  })()
  return workers<string[]>(workerNum, ch.receiver())
}

export async function labels(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  prs: number[]
): Promise<string[]> {
  let ret: string[] = []
  const [cancelPromise, cancel] = emptyPromise()
  let err: any
  const errCh = new Chan<any>()
  const recv = pullRequesets(
    [cancelPromise, cancel],
    errCh.send,
    octokit,
    owner,
    repo,
    prs
  )
  ;(async () => {
    for await (const i of errCh.receiver()) {
      if (err === undefined) {
        err = i
      }
    }
  })()
  for await (const i of recv) {
    ret = ret.concat(i)
  }
  errCh.close()
  cancel()
  if (err) {
    throw err
  }
  return [...new Set<string>(ret)]
}
