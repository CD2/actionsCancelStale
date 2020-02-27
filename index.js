// @ts-check
const core = require('@actions/core');
const github = require('@actions/github');

run().catch(error =>{  
  core.setFailed(error.message);
})

async function run() {
  const token = core.getInput('token');

  const owner = github.context.repo.owner
  const repo = github.context.repo.repo
    
  let branch = github.context.ref.replace("refs/heads/", "")
  let sha = github.context.sha

  if (github.context.payload.pull_request) {
    branch = github.context.payload.pull_request.head.ref;
    sha = github.context.payload.pull_request.head.sha;
  }

  const octokit = new github.GitHub(token);

  const workflowId = await getWorkflowId(octokit)
  
  const { data } = await octokit.actions.listWorkflowRuns({ 
    owner,
    repo,
    branch,
    workflow_id: workflowId
  });


  console.log(`Found ${data.total_count} runs total.`);
  const thisWorkflow = data.workflow_runs.find(workflow => workflow.head_sha === sha)

  if(!thisWorkflow) {
    console.log("Could not determine current workflow. Not cancelling stale")
  }

  const runningWorkflows = data.workflow_runs.filter(
    workflow => 
      workflow.head_sha !== sha &&
      workflow.status !== 'completed' &&
      new Date(workflow.created_at) < new Date(thisWorkflow.created_at)
  );

  console.log(`Found ${runningWorkflows.length} runs in progress.`);
  for (const { id, head_sha, status } of runningWorkflows) {
    console.log('Cancelling another run: ', { id, head_sha, status });
    const res = await octokit.actions.cancelWorkflowRun({ owner, repo, run_id: id });
    console.log(`Status ${res.status}`);
  }
  console.log('Done.');
}


/**
 * 
 * @param {github.GitHub} octokit 
 */
async function getWorkflowId(octokit) {
  const owner = github.context.repo.owner
  const repo = github.context.repo.repo
  const workflowName = process.env.GITHUB_WORKFLOW

  const {data} = await octokit.actions.listRepoWorkflows({ repo, owner })
  const workflow = data.workflows.find(workflow => workflow.name === workflowName)

  if (!workflow) {
    throw new Error("Could not find workflow")
  }

  return workflow.id
}