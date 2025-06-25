const { getRepositoryProperties } = require('../index.js');
const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');

describe('getRepositoryProperties', () => {
  let mockOctokit;

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    
    // Create a mock Octokit instance
    mockOctokit = {
      request: jest.fn()
    };
    
    // Set up the Octokit constructor to return the mock
    Octokit.mockImplementation(() => mockOctokit);
  });

  test('should successfully retrieve repository properties', async () => {
    const gh_token = 'fake_token';
    const repo_owner = 'fake_owner';
    const repo_name = 'fake_repo';

    // Mock Octokit response
    const mockResponse = {
      data: [
        { property_name: 'deploy', value: 'ci/cd' },
        { property_name: 'framework', value: 'poetry' },
        { property_name: 'gerenciador', value: 'poetry' },
        { property_name: 'infraestrutura', value: 'github' },
        { property_name: 'linguagem', value: 'python' },
        { property_name: 'projeto', value: 'GCA' },
      ]
    };

    // Set up the mock to return the expected response
    mockOctokit.request.mockResolvedValue(mockResponse);
    
    // Call the function to be tested
    const result = await getRepositoryProperties(gh_token, repo_owner, repo_name);

    // Check if the result matches the expected output
    expect(result).toEqual({
      deploy: 'ci/cd',
      framework: 'poetry',
      gerenciador: 'poetry',
      infraestrutura: 'github',
      linguagem: 'python',
      projeto: 'GCA',
    });

    // Check if Octokit was configured correctly
    expect(Octokit).toHaveBeenCalledWith({ auth: gh_token });
    
    // Check if the request was made with the correct parameters
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'GET /repos/{owner}/{repo}/properties/values',
      {
        owner: repo_owner,
        repo: repo_name,
      }
    );

    // Check if the success message was logged
    expect(core.info).toHaveBeenCalledWith('Repository properties fake_owner/fake_repo successfully retrieved!');
  });

  test('should handle error when retrieving repository properties', async () => {
    const gh_token = 'fake_token';
    const repo_owner = 'fake_owner';
    const repo_name = 'fake_repo';
    
    // Set up the mock to simulate an error
    mockOctokit.request.mockRejectedValue({
      status: 404,
      message: 'Not Found'
    });
    
    // Call the function and expect it to return an empty object
    const result = await getRepositoryProperties(gh_token, repo_owner, repo_name);
    
    // Check if the result is an empty object
    expect(result).toEqual({});
    
    // Check if core.warning was not called (since MSG_HELPER was removed)
    expect(core.warning).not.toHaveBeenCalled();
  });

  test('should handle error without status', async () => {
    const gh_token = 'fake_token';
    const repo_owner = 'fake_owner';
    const repo_name = 'fake_repo';
    
    // Set up the mock to simulate an error without status
    mockOctokit.request.mockRejectedValue(new Error('Network error'));
    
    const result = await getRepositoryProperties(gh_token, repo_owner, repo_name);
    
    expect(result).toEqual({});
    expect(core.warning).not.toHaveBeenCalled();
  });
});