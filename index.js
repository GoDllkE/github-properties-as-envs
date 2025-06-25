// imports (CommonJS)
const core = require('@actions/core');
const { Octokit } = require("@octokit/rest");

// ================================================================
// Utility functions
// ================================================================
function filterRepoProperties(content) {
  // Filters the raw data obtained from the repository
  let filtred_content = {};

  // Simplifies the data structure
  content.data.forEach(property => {
    filtred_content[property.property_name] = property.value;
  });

  // Returns the filtered content
  return filtred_content;
}

function exportGithubOutput(properties) {
  // Exports the repository properties to GITHUB_OUTPUT
  for (const [key, value] of Object.entries(properties)) {
    core.setOutput(key, value);
    core.info(`Exported property: ${key} = ${value}`);
  }
}

function validateInputs(repo_owner, repo_name) {
  // Validates if the repository owner name is valid
  if (repo_owner === '' ) {
    core.error(`Invalid repository owner name: ${repo_owner}`);
    core.warning(`Make sure the repository owner name is valid (value: ${repo_owner}).`);
    return 1;
  }

  // Validates if the repository name is valid
  if (repo_name === '' ) {
    core.error(`Invalid repository name: ${repo_name}`);
    core.warning(`Make sure the repository name is valid (value: ${repo_name}).`);
    return 1;
  }

  return 0;
}

// ================================================================
// Async functions
// ================================================================
async function validateCredentials(gh_token) {
  // Sets up the Github client
  const octokit = new Octokit({
    auth: gh_token
  });

  try {
    core.info('Validating Github authentication token...');
    const response = await octokit.rest.users.getAuthenticated();
    core.info('Authenticated user:', response.data.login);
    return 0;
  } catch (error) {
    // If the token is invalid, return 1
    core.error('Error validating Github authentication token:');
    core.error(`Message: (${error.status}) ${error.message}`);
    return 1;
  }
}

async function getRepositoryProperties(gh_token, repo_owner, repo_name) {
  // Sets up the Github client
  const octokit = new Octokit({
    auth: gh_token,
  });

  try {
    // Makes the request to get the repository properties
    const properties_values = await octokit.request('GET /repos/{owner}/{repo}/properties/values', {
      owner: repo_owner,
      repo: repo_name,
    });

    // Filters and formats the repository properties
    const repo_properties = filterRepoProperties(properties_values);

    // Returns data
    core.info(`Repository properties ${repo_owner}/${repo_name} successfully retrieved!`);
    return repo_properties;

  } catch (error) {
    console.error(`Error retrieving repository properties: (${error.status}) ${error.message}`);
    return {};
  }
}

// ================================================================
// Main async function
// ================================================================
async function main() {
  // Retrieves required input variables, alternatively tries to get from GitHub Actions environment variable
  const gh_token =  process.env.GH_PAT || process.env.GITHUB_TOKEN || core.getInput('github_token') || '';

  // Tries to get the input value, if it doesn't exist, tries to get from GitHub Actions environment variable
  const repo_owner = core.getInput('repository_owner') || process.env.GITHUB_REPOSITORY_OWNER || '';
  const repo_name = core.getInput('repository_name') || process.env.GITHUB_REPOSITORY_NAME || '';

  // Validates if the variables are filled
  if(validateInputs(repo_owner, repo_name) !== 0) { process.exit(1); }

  // Validates if the Github authentication token is valid
  if (await validateCredentials(gh_token) !== 0) { process.exit(1); }

  // Retrieves the repository properties
  const properties = await getRepositoryProperties(gh_token, repo_owner, repo_name);
  if (Object.keys(properties).length === 0) { process.exit(1); }

  // Exports the repository properties to GITHUB_OUTPUT
  exportGithubOutput(properties);

  // Ends the program
  process.exit(0);
}

// Runs the main function if the script is run directly
/* istanbul ignore next */
if (require.main === module) {
  main();
}

// Exports (CommonJS)
// Exports the functions to be used in other modules (unit tests)
module.exports = {
  validateInputs,
  validateCredentials,
  filterRepoProperties,
  getRepositoryProperties,
  exportGithubOutput,
  main
};