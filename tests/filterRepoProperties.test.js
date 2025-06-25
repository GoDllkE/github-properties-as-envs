// Imports
const { filterRepoProperties } = require('../index.js');
const core = require('@actions/core');

describe('filterRepoProperties', () => {

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  test('should filter and format repository properties (1/3)', () => {
    const content_to_be_tested = { 
      data: [
        { property_name: 'deploy', value: 'ci/cd' },
        { property_name: 'framework', value: 'poetry' },
        { property_name: 'gerenciador', value: 'poetry' },
        { property_name: 'infraestrutura', value: 'github' },
        { property_name: 'linguagem', value: 'python' },
        { property_name: 'projeto', value: 'GCA' },
      ]
    };

    const content_to_be_expected = {
      deploy: 'ci/cd',
      framework: 'poetry',
      gerenciador: 'poetry',
      infraestrutura: 'github',
      linguagem: 'python',
      projeto: 'GCA',
    }

    // Call function to be tested
    const result = filterRepoProperties(content_to_be_tested);
    
    // Check if the result matches the expected output
    expect(result).toEqual(content_to_be_expected);
  });

  test('should filter and format repository properties (2/3)', () => {
    const content_to_be_tested = { 
      data: [
        { property_name: 'deploy', value: 'ci/cd' },
        { property_name: 'framework', value: 'rake' },
        { property_name: 'gerenciador', value: 'bundle' },
        { property_name: 'infraestrutura', value: 'github' },
        { property_name: 'linguagem', value: 'ruby' },
        { property_name: 'projeto', value: 'GCA' },
      ]
    };

    const content_to_be_expected = {
      deploy: 'ci/cd',
      framework: 'rake',
      gerenciador: 'bundle',
      infraestrutura: 'github',
      linguagem: 'ruby',
      projeto: 'GCA',
    }

    // Call function to be tested
    const result = filterRepoProperties(content_to_be_tested);
    
    // Check if the result matches the expected output
    expect(result).toEqual(content_to_be_expected);
  });

  test('should filter and format repository properties (3/3)', () => {
    const content_to_be_tested = { 
      data: [
        { property_name: 'deploy', value: 'ci/cd' },
        { property_name: 'framework', value: 'rake' },
        { property_name: 'gerenciador', value: 'bundle' },
        { property_name: 'infraestrutura', value: 'github' },
        { property_name: 'linguagem', value: 'ruby' },
        { property_name: 'projeto', value: 'GCA' },
      ]
    };

    const content_to_be_expected = {
      deploy: 'ci/cd',
      framework: 'rake',
      gerenciador: 'bundle',
      infraestrutura: 'github',
      linguagem: 'ruby',
      projeto: 'GCA',
    }

    // Call function to be tested
    const result = filterRepoProperties(content_to_be_tested);
    
    // Check if the result matches the expected output
    expect(result).toEqual(content_to_be_expected);
  });

});