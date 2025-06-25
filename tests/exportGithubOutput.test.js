const { exportGithubOutput } = require('../index');
const core = require('@actions/core');

// Mock @actions/core
jest.mock('@actions/core', () => ({
  setOutput: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  debug: jest.fn()
}));

// ================= Tests for exportGithubOutput =================
describe('exportGithubOutput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should export all properties', () => {
    const properties = {
      deploy: 'ci/cd',
      framework: 'poetry',
      gerenciador: 'poetry',
      infraestrutura: 'github',
      linguagem: 'python',
      projeto: 'GCA',
    };

    exportGithubOutput(properties);

    // Check if all properties were exported
    expect(core.setOutput).toHaveBeenCalledWith('deploy', 'ci/cd');
    expect(core.setOutput).toHaveBeenCalledWith('framework', 'poetry');
    expect(core.setOutput).toHaveBeenCalledWith('gerenciador', 'poetry');
    expect(core.setOutput).toHaveBeenCalledWith('infraestrutura', 'github');
    expect(core.setOutput).toHaveBeenCalledWith('linguagem', 'python');
    expect(core.setOutput).toHaveBeenCalledWith('projeto', 'GCA');
    
    // Check if it was called 6 times (all properties)
    expect(core.setOutput).toHaveBeenCalledTimes(6);
  });

  test('should handle empty properties', () => {
    const properties = {};

    exportGithubOutput(properties);

    expect(core.setOutput).not.toHaveBeenCalled();
    expect(core.info).not.toHaveBeenCalled();
  });

  test('should export properties with special values', () => {
    const properties = {
      deploy: 'ci/cd',
      framework: 'spring-boot'
    };

    exportGithubOutput(properties);

    expect(core.setOutput).toHaveBeenCalledWith('deploy', 'ci/cd');
    expect(core.setOutput).toHaveBeenCalledWith('framework', 'spring-boot');
    
    expect(core.setOutput).toHaveBeenCalledTimes(2);
  });
});