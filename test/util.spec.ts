import { getOctokit } from '@actions/github'
import { jest } from '@jest/globals'
import { note, pulls } from '../src/util'

describe('noe()', () => {
  it('should return descriptionHTML', async () => {
    const octokit = {
      graphql: jest.fn().mockImplementation(() =>
        Promise.resolve({
          repository: {
            release: {
              descriptionHTML: 'html'
            }
          }
        })
      )
    }
    await expect(
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
      graphql: jest.fn().mockImplementation(() =>
        Promise.resolve({
          repository: {
            release: {}
          }
        })
      )
    }
    await expect(
      note(octokit as any, 'test-owner', 'test-name', 'v0.1.1')
    ).rejects.toThrowError(/not included/)
  })
})

describe('pulls()', () => {
  it('should return pulls', async () => {
    expect(
      pulls(
        `
<h2>What's Changed</h2>
<ul>
<li>Setup by <a class="user-mention" data-hovercard-type="user" data-hovercard-url="/users/hankei6km/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/hankei6km">@hankei6km</a> in <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="1108312729" data-permission-text="Title is private" data-url="https://github.com/hankei6km/gas-md2html/issues/1" data-hovercard-type="pull_request" data-hovercard-url="/hankei6km/gas-md2html/pull/1/hovercard" href="https://github.com/hankei6km/gas-md2html/pull/1">#1</a></li>
<li>Use "hast-util-sanitize" by <a class="user-mention" data-hovercard-type="user" data-hovercard-url="/users/hankei6km/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/hankei6km">@hankei6km</a> in <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="1110220265" data-permission-text="Title is private" data-url="https://github.com/hankei6km/gas-md2html/issues/2" data-hovercard-type="pull_request" data-hovercard-url="/hankei6km/gas-md2html/pull/2/hovercard" href="https://github.com/hankei6km/gas-md2html/pull/2">#2</a></li>
<ul>
<p><strong>Full Changelog</strong>: <a class=\"commit-link\" href=\"https://github.com/hankei6km/gas-md2html/compare/v0.4.0...v0.5.0\"><tt>v0.4.0...v0.5.0</tt></a></p>
      `,
        'hankei6km',
        'gas-md2html'
      )
    ).toEqual([1, 2])
  })
  it('should filter owner', async () => {
    expect(
      pulls(
        `
<h2>What's Changed</h2>
<ul>
<li>Setup by <a class="user-mention" data-hovercard-type="user" data-hovercard-url="/users/hankei6km-aaa/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/hankei6km-aaa">@hankei6km-aaa</a> in <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="1108312729" data-permission-text="Title is private" data-url="https://github.com/hankei6km-aaa/gas-md2html/issues/1" data-hovercard-type="pull_request" data-hovercard-url="/hankei6km-aaa/gas-md2html/pull/1/hovercard" href="https://github.com/hankei6km-aaa/gas-md2html/pull/1">#1</a></li>
<li>Use "hast-util-sanitize" by <a class="user-mention" data-hovercard-type="user" data-hovercard-url="/users/hankei6km/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/hankei6km">@hankei6km</a> in <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="1110220265" data-permission-text="Title is private" data-url="https://github.com/hankei6km/gas-md2html/issues/2" data-hovercard-type="pull_request" data-hovercard-url="/hankei6km/gas-md2html/pull/2/hovercard" href="https://github.com/hankei6km/gas-md2html/pull/2">#2</a></li>
<ul>
<p><strong>Full Changelog</strong>: <a class=\"commit-link\" href=\"https://github.com/hankei6km/gas-md2html/compare/v0.4.0...v0.5.0\"><tt>v0.4.0...v0.5.0</tt></a></p>
      `,
        'hankei6km',
        'gas-md2html'
      )
    ).toEqual([2])
  })
  it('should filter name', async () => {
    expect(
      pulls(
        `
<h2>What's Changed</h2>
<ul>
<li>Setup by <a class="user-mention" data-hovercard-type="user" data-hovercard-url="/users/hankei6km/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/hankei6km">@hankei6km</a> in <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="1108312729" data-permission-text="Title is private" data-url="https://github.com/hankei6km/gas-md2html-aaa/issues/1" data-hovercard-type="pull_request" data-hovercard-url="/hankei6km/gas-md2html-aaa/pull/1/hovercard" href="https://github.com/hankei6km/gas-md2html-aaa/pull/1">#1</a></li>
<li>Use "hast-util-sanitize" by <a class="user-mention" data-hovercard-type="user" data-hovercard-url="/users/hankei6km/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/hankei6km">@hankei6km</a> in <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="1110220265" data-permission-text="Title is private" data-url="https://github.com/hankei6km/gas-md2html/issues/2" data-hovercard-type="pull_request" data-hovercard-url="/hankei6km/gas-md2html/pull/2/hovercard" href="https://github.com/hankei6km/gas-md2html/pull/2">#2</a></li>
<ul>
<p><strong>Full Changelog</strong>: <a class=\"commit-link\" href=\"https://github.com/hankei6km/gas-md2html/compare/v0.4.0...v0.5.0\"><tt>v0.4.0...v0.5.0</tt></a></p>
      `,
        'hankei6km',
        'gas-md2html'
      )
    ).toEqual([2])
  })
  it('should remove duplicate', async () => {
    expect(
      pulls(
        `
<h2>What's Changed</h2>
<ul>
<li>Setup by <a class="user-mention" data-hovercard-type="user" data-hovercard-url="/users/hankei6km/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/hankei6km">@hankei6km</a> in <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="1108312729" data-permission-text="Title is private" data-url="https://github.com/hankei6km/gas-md2html/issues/1" data-hovercard-type="pull_request" data-hovercard-url="/hankei6km/gas-md2html/pull/1/hovercard" href="https://github.com/hankei6km/gas-md2html/pull/1">#1</a></li>
<li>Setup by <a class="user-mention" data-hovercard-type="user" data-hovercard-url="/users/hankei6km/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/hankei6km">@hankei6km</a> in <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="1108312729" data-permission-text="Title is private" data-url="https://github.com/hankei6km/gas-md2html/issues/1" data-hovercard-type="pull_request" data-hovercard-url="/hankei6km/gas-md2html/pull/1/hovercard" href="https://github.com/hankei6km/gas-md2html/pull/1">#1</a></li>
<li>Use "hast-util-sanitize" by <a class="user-mention" data-hovercard-type="user" data-hovercard-url="/users/hankei6km/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/hankei6km">@hankei6km</a> in <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="1110220265" data-permission-text="Title is private" data-url="https://github.com/hankei6km/gas-md2html/issues/2" data-hovercard-type="pull_request" data-hovercard-url="/hankei6km/gas-md2html/pull/2/hovercard" href="https://github.com/hankei6km/gas-md2html/pull/2">#2</a></li>
<ul>
<p><strong>Full Changelog</strong>: <a class=\"commit-link\" href=\"https://github.com/hankei6km/gas-md2html/compare/v0.4.0...v0.5.0\"><tt>v0.4.0...v0.5.0</tt></a></p>
      `,
        'hankei6km',
        'gas-md2html'
      )
    ).toEqual([1, 2])
  })
})
