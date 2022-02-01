# collect-labels-from-release-note

This action collects labels from the release note.

## Inputs

### `token`

**Required** The token to call GitHub API in action.

### `repository`

**Required** The name of the repository.

### `tag_name`

**Required** The name of the tag name to access the release.

## Outputs

### `labels`

labels collected from the release note.

## Example usage

```yaml
  - name: Collect
    id: collect
    uses: hankei6km/collect-labels-from-release-note@v0.2.0
    with:
      token: ${{ secrets.GITHUB_TOKEN}}
      repository: hankei6km/collect-labels-from-release-note
      tag_name: v0.2.x
  - name: Contains item
    run: test "${CONTAIN}" = "true"
    env:
      CONTAIN: ${{ contains(toJson(steps.collect.outputs.labels), 'testing') }}
```

## Licenses

MIT License

Copyright (c) 2022 hankei6km

