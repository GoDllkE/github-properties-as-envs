const { main } = require('../index');
const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

// Mock console.error to silence logs during tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock Octokit at the module level
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn()
}));

describe('main', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment variables
    delete process.env.github_token;
    delete process.env.GH_PAT;
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_REPOSITORY_OWNER;
    delete process.env.GITHUB_REPOSITORY_NAME;
    
    // Mock core.getInput functions
    core.getInput.mockReturnValue('');
  });

  afterAll(() => {
    mockExit.mockRestore();
    mockConsoleError.mockRestore();
  });

  // ================= Success Tests =================
  test('should execute full flow successfully using core inputs', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockResolvedValue({
            data: { login: 'test-user' }
          })
        }
      },
      request: jest.fn().mockResolvedValue({
        data: [
          { property_name: 'deploy', value: 'ci/cd' },
          { property_name: 'framework', value: 'poetry' },
          { property_name: 'gerenciador', value: 'poetry' },
          { property_name: 'infraestrutura', value: 'github' },
          { property_name: 'linguagem', value: 'python' },
          { property_name: 'projeto', value: 'GCA' },
          { property_name: 'monorepositorio', value: 'false' }
        ]
      })
    };
    
    Octokit.mockImplementation(() => mockOctokit);

    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return 'vr-tools';
        case 'repository_name': return 'test-repo';
        case 'validate_properties': return 'true';
        case 'github_token': return 'input_token';
        default: return '';
      }
    });

    await main();

    expect(Octokit).toHaveBeenCalledWith({ auth: 'input_token' });
    expect(mockOctokit.rest.users.getAuthenticated).toHaveBeenCalled();
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'GET /repos/{owner}/{repo}/properties/values',
      {
        owner: 'vr-tools',
        repo: 'test-repo'
      }
    );
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  test('should execute successfully using environment variables', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockResolvedValue({
            data: { login: 'test-user' }
          })
        }
      },
      request: jest.fn().mockResolvedValue({
        data: [
          { property_name: 'deploy', value: 'manual' },
          { property_name: 'framework', value: 'express' },
          { property_name: 'gerenciador', value: 'npm' },
          { property_name: 'infraestrutura', value: 'azure' },
          { property_name: 'linguagem', value: 'javascript' },
          { property_name: 'projeto', value: 'Frontend' },
          { property_name: 'monorepositorio', value: 'true' }
        ]
      })
    };
    
    Octokit.mockImplementation(() => mockOctokit);

    process.env.GITHUB_TOKEN = 'env_token';
    process.env.GITHUB_REPOSITORY_OWNER = 'env-owner';
    process.env.GITHUB_REPOSITORY_NAME = 'env-repo';

    await main();

    expect(Octokit).toHaveBeenCalledWith({ auth: 'env_token' });
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'GET /repos/{owner}/{repo}/properties/values',
      {
        owner: 'env-owner',
        repo: 'env-repo'
      }
    );
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  test('should execute successfully when validate_properties is false', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockResolvedValue({
            data: { login: 'test-user' }
          })
        }
      },
      request: jest.fn().mockResolvedValue({
        data: [
          { property_name: 'deploy', value: 'ci/cd' },
          { property_name: 'framework', value: 'poetry' }
        ]
      })
    };
    
    Octokit.mockImplementation(() => mockOctokit);

    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return 'vr-tools';
        case 'repository_name': return 'test-repo';
        case 'validate_properties': return 'false';
        case 'github_token': return 'valid_token';
        default: return '';
      }
    });

    await main();

    expect(mockExit).toHaveBeenCalledWith(0);
  });

  test('should use correct priority for tokens (GH_PAT > GITHUB_TOKEN > core.getInput)', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockResolvedValue({
            data: { login: 'test-user' }
          })
        }
      },
      request: jest.fn().mockResolvedValue({
        data: []
      })
    };
    
    Octokit.mockImplementation(() => mockOctokit);

    process.env.GH_PAT = 'priority_token';
    process.env.GITHUB_TOKEN = 'second_token';

    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return 'test-owner';
        case 'repository_name': return 'test-repo';
        case 'github_token': return 'third_token';
        default: return '';
      }
    });

    await main();

    expect(Octokit).toHaveBeenCalledWith({ auth: 'priority_token' });
  });

  test('should use correct priority for repository (core.getInput > GITHUB_REPOSITORY_*)', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockResolvedValue({
            data: { login: 'test-user' }
          })
        }
      },
      request: jest.fn().mockResolvedValue({
        data: []
      })
    };
    
    Octokit.mockImplementation(() => mockOctokit);

    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return 'input-owner';
        case 'repository_name': return 'input-repo';
        case 'github_token': return 'valid_token';
        default: return '';
      }
    });

    process.env.GITHUB_REPOSITORY_OWNER = 'env-owner';
    process.env.GITHUB_REPOSITORY_NAME = 'env-repo';

    await main();

    expect(mockOctokit.request).toHaveBeenCalledWith(
      'GET /repos/{owner}/{repo}/properties/values',
      {
        owner: 'input-owner',
        repo: 'input-repo'
      }
    );
  });

  // ================= Failure Tests - validateInputs =================
  test('should exit with code 1 when validateInputs fails', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockRejectedValue({
            status: 401,
            message: 'Bad credentials'
          })
        }
      },
      request: jest.fn()
    };
    
    Octokit.mockImplementation(() => mockOctokit);
    
    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return ''; // Empty - validateInputs fails
        case 'repository_name': return 'test-repo';
        case 'github_token': return 'valid_token';
        default: return '';
      }
    });

    await main();

    expect(Octokit).toHaveBeenCalledWith({ auth: 'valid_token' });
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  // ================= Failure Tests - validateCredentials =================
  test('should exit with code 1 when validateCredentials fails', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockRejectedValue({
            status: 401,
            message: 'Bad credentials'
          })
        }
      },
      request: jest.fn().mockResolvedValue({ data: [] })
    };
    
    Octokit.mockImplementation(() => mockOctokit);
    
    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return 'vr-tools';
        case 'repository_name': return 'test-repo';
        case 'github_token': return 'invalid_token';
        default: return '';
      }
    });

    await main();

    expect(Octokit).toHaveBeenCalledWith({ auth: 'invalid_token' });
    expect(mockOctokit.rest.users.getAuthenticated).toHaveBeenCalled();
    expect(mockOctokit.request).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  // ================= Failure Tests - getRepositoryProperties =================
  test('should exit with code 1 when getRepositoryProperties returns empty object', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockResolvedValue({
            data: { login: 'test-user' }
          })
        }
      },
      request: jest.fn().mockRejectedValue({
        status: 404,
        message: 'Not Found'
      })
    };
    
    Octokit.mockImplementation(() => mockOctokit);

    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return 'vr-tools';
        case 'repository_name': return 'test-repo';
        case 'github_token': return 'valid_token';
        default: return '';
      }
    });

    await main();

    expect(mockOctokit.request).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  test('should exit with code 1 when getRepositoryProperties returns empty array', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockResolvedValue({
            data: { login: 'test-user' }
          })
        }
      },
      request: jest.fn().mockResolvedValue({
        data: []
      })
    };
    
    Octokit.mockImplementation(() => mockOctokit);

    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return 'vr-tools';
        case 'repository_name': return 'test-repo';
        case 'github_token': return 'valid_token';
        default: return '';
      }
    });

    await main();

    expect(mockOctokit.request).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  // ================= Special Cases Tests =================
  test('should use empty string when no token is provided', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockRejectedValue({
            status: 401,
            message: 'Bad credentials'
          })
        }
      },
      request: jest.fn().mockResolvedValue({ data: [] })
    };
    
    Octokit.mockImplementation(() => mockOctokit);

    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return 'vr-tools';
        case 'repository_name': return 'test-repo';
        case 'github_token': return '';
        default: return '';
      }
    });

    await main();

    expect(Octokit).toHaveBeenCalledWith({ auth: '' });
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  test('should use empty string when no repository_owner is provided', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockRejectedValue({
            status: 401,
            message: 'Bad credentials'
          })
        }
      },
      request: jest.fn()
    };
    
    Octokit.mockImplementation(() => mockOctokit);
    
    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return '';
        case 'repository_name': return 'test-repo';
        case 'github_token': return 'valid_token';
        default: return '';
      }
    });

    await main();

    expect(Octokit).toHaveBeenCalledWith({ auth: 'valid_token' });
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  test('should treat validate_properties as true by default', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockResolvedValue({
            data: { login: 'test-user' }
          })
        }
      },
      request: jest.fn().mockResolvedValue({
        data: [
          { property_name: 'deploy', value: 'ci/cd' },
          { property_name: 'framework', value: 'poetry' },
          { property_name: 'gerenciador', value: 'poetry' },
          { property_name: 'infraestrutura', value: 'github' },
          { property_name: 'linguagem', value: 'python' },
          { property_name: 'projeto', value: 'GCA' },
          { property_name: 'monorepositorio', value: 'false' }
        ]
      })
    };
    
    Octokit.mockImplementation(() => mockOctokit);

    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return 'vr-tools';
        case 'repository_name': return 'test-repo';
        case 'validate_properties': return '';
        case 'github_token': return 'valid_token';
        default: return '';
      }
    });

    await main();

    expect(mockExit).toHaveBeenCalledWith(0);
  });

  // ================= Error Handling Tests =================
  test('should handle unexpected errors during execution', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockResolvedValue({
            data: { login: 'test-user' }
          })
        }
      },
      request: jest.fn().mockRejectedValue(new Error('Network error'))
    };
    
    Octokit.mockImplementation(() => mockOctokit);

    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return 'vr-tools';
        case 'repository_name': return 'test-repo';
        case 'github_token': return 'valid_token';
        default: return '';
      }
    });

    await main();

    expect(mockOctokit.rest.users.getAuthenticated).toHaveBeenCalled();
    expect(mockOctokit.request).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  test('should handle errors without status property', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockResolvedValue({
            data: { login: 'test-user' }
          })
        }
      },
      request: jest.fn().mockRejectedValue(new Error('Some API error'))
    };
    
    Octokit.mockImplementation(() => mockOctokit);

    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return 'vr-tools';
        case 'repository_name': return 'test-repo';
        case 'github_token': return 'valid_token';
        default: return '';
      }
    });

    await main();

    expect(mockOctokit.request).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Error retrieving repository properties: (undefined) Some API error')
    );
  });

  test('should show error message in validateCredentials', async () => {
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockRejectedValue({
            status: 401,
            message: 'Bad credentials from API'
          })
        }
      },
      request: jest.fn().mockResolvedValue({ data: [] })
    };
    
    Octokit.mockImplementation(() => mockOctokit);

    core.getInput.mockImplementation((input) => {
      switch (input) {
        case 'repository_owner': return 'vr-tools';
        case 'repository_name': return 'test-repo';
        case 'github_token': return 'invalid_token';
        default: return '';
      }
    });

    const mockCoreError = jest.spyOn(core, 'error');

    await main();

    expect(mockCoreError).toHaveBeenCalledWith('Error validating Github authentication token:');
    expect(mockCoreError).toHaveBeenCalledWith('Message: (401) Bad credentials from API');
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});