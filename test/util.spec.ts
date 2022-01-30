import { jest } from '@jest/globals'
import { note } from '../src/util'

describe('noe()', () => {
  it('should return descriptionHTML', async () => {
    const octokit = {
      graphql: jest.fn().mockReturnValue({
        repository: {
          release: {
            descriptionHTML: 'html'
          }
        }
      })
    }
    expect(
      note(octokit as any, 'test-owner', 'test-name', 'v0.1.1')
    ).resolves.toEqual('html')
    expect(octokit.graphql).toHaveBeenCalledWith(
      `
query ($owner: String!, $name: String!, $tagName: String!) {
  repository(owner:$owner, name:$name) {
    release(tagName:$tagName){
      descriptionHTML
    }
  }
}
`,
      { name: 'test-name', owner: 'test-owner', tagName: 'v0.1.1' }
    )
  })
  it('should throw error when descriptionHTML is not included', async () => {
    const octokit = {
      graphql: jest.fn().mockReturnValue({
        repository: {
          release: {}
        }
      })
    }
    expect(
      note(octokit as any, 'test-owner', 'test-name', 'v0.1.1')
    ).rejects.toThrowError('not included')
  })
})
