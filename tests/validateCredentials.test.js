const { validateCredentials } = require('../index.js');
const { Octokit } = require('@octokit/rest');


// Test scenarios
describe('validateCredentials', () => {
  let mockOctokit;

  // Runs before each test
  beforeEach(() => {
    // Clear all mocks to avoid interference between tests
    jest.clearAllMocks();
    
    // Create a mock Octokit simulating the expected structure
    mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn() // Mock the function that validates the token
        }
      }
    };
    
    // Make any new Octokit instance use the above mock
    Octokit.mockImplementation(() => mockOctokit);
  });

  // Test scenarios
  test('should return 0 for valid token', async () => {
    // Set up the mock to return success when calling getAuthenticated
    mockOctokit.rest.users.getAuthenticated.mockResolvedValue({
      data: { login: 'octocat' }
    });

    // Call the function to be tested
    const result = await validateCredentials('valid_token');

    // Check if the result is 0, indicating success
    expect(result).toBe(0);
    expect(Octokit).toHaveBeenCalledWith({ auth: 'valid_token' });
  });

  test('should return 1 for invalid token', async () => {
    // Set up the mock to simulate an error when calling getAuthenticated
    mockOctokit.rest.users.getAuthenticated.mockRejectedValue(new Error('Requires authentication'));

    // Call the function to be tested
    const result = await validateCredentials('invalid_token');

    // Check if the result is 1, indicating failure
    expect(result).toBe(1);
    expect(Octokit).toHaveBeenCalledWith({ auth: 'invalid_token' });
  });

  test('should return 1 for token without sufficient permissions', async () => {
    // Set up the mock to simulate a permission error
    mockOctokit.rest.users.getAuthenticated.mockRejectedValue(new Error('Forbidden'));

    // Call the function to be tested
    const result = await validateCredentials('token_without_permissions');

    // Check if the result is 1, indicating failure
    expect(result).toBe(1);
    expect(Octokit).toHaveBeenCalledWith({ auth: 'token_without_permissions' });
  });

})