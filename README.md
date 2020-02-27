# Cancel stale workflows

Automatically cancel workflows which are in progress but stale.


## Usage

```yaml
- uses: ./.github/actions/cancelStaleActions
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```