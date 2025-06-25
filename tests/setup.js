// Arquivo de configurações globais para todos os testes dentro da pasta tests/
// Este arquivo é executado antes de cada teste para configurar o ambiente de testes e mocks necessários.
// Ele deve ser referenciado no arquivo jest.config.js na propriedade setupFilesAfterEnv

const { setOutput } = require("@actions/core");

// Mock global do @octokit/rest
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn()
}));

// Mock global do @actions/core
jest.mock('@actions/core', () => ({
  warning: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  setOutput: jest.fn(),
  getInput: jest.fn()
}));

// Mock global do @actions/github
jest.mock('@actions/github', () => ({
  log: {
    warning: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

// Mock global do console para evitar logs durante os testes
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};