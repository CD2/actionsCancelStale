# Cancel stale workflows

Automatically cancel workflows which are in progress but stale.


## Usage

Place this inside your workflow file:

```yaml
- uses: CD2/actionsCancelStale@master
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

I recommend placing it as your first step, as I don't know a reason why you wouldn't cancel existing workflows instantly.

> NOTE: This will cancel the entire stale workflow, it doesn't matter which job is currently running.