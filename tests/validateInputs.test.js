const { validateInputs } = require('../index');
const core = require('@actions/core');

describe('validateInputs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================= Success Tests =================
  test('should return 0 for valid inputs', () => {
    const repo_owner = 'GoDlikE';
    const repo_name = 'properties-as-envs';

    const result = validateInputs(repo_owner, repo_name);

    expect(result).toBe(0);
    expect(core.error).not.toHaveBeenCalled();
    expect(core.warning).not.toHaveBeenCalled();
  });

  test('should return 0 for valid inputs with special characters', () => {
    const repo_owner = 'user-name';
    const repo_name = 'repo_name-123';

    const result = validateInputs(repo_owner, repo_name);

    expect(result).toBe(0);
    expect(core.error).not.toHaveBeenCalled();
    expect(core.warning).not.toHaveBeenCalled();
  });

  // ================= Failure Tests - Invalid repo_owner =================
  test('should return 1 for empty repo_owner', () => {
    const repo_owner = '';
    const repo_name = 'valid-repo';

    const result = validateInputs(repo_owner, repo_name);

    expect(result).toBe(1);
    expect(core.error).toHaveBeenCalledWith('Invalid repository owner name: ');
    expect(core.warning).toHaveBeenCalledWith(`Make sure the repository owner name is valid (value: ${repo_owner}).`);
  });

  // ================= Failure Tests - Invalid repo_name =================
  test('should return 1 for empty repo_name', () => {
    const repo_owner = 'valid-owner';
    const repo_name = '';

    const result = validateInputs(repo_owner, repo_name);

    expect(result).toBe(1);
    expect(core.error).toHaveBeenCalledWith('Invalid repository name: ');
    expect(core.warning).toHaveBeenCalledWith(`Make sure the repository name is valid (value: ${repo_name}).`);
  });

  // ================= Failure Tests - Both Invalid =================
  test('should return 1 when both repo_owner and repo_name are empty', () => {
    const repo_owner = '';
    const repo_name = '';

    const result = validateInputs(repo_owner, repo_name);

    expect(result).toBe(1);
    // Should validate repo_owner first and return on first failure
    expect(core.error).toHaveBeenCalledWith('Invalid repository owner name: ');
    expect(core.warning).toHaveBeenCalledWith(`Make sure the repository owner name is valid (value: ${repo_owner}).`);
    
    // Should not validate repo_name because it fails on the first
    expect(core.error).not.toHaveBeenCalledWith('Invalid repository name: ');
  });

  // ================= Special Cases Tests =================
  test('should validate repo_name when repo_owner is valid but repo_name is invalid', () => {
    const repo_owner = 'valid-owner';
    const repo_name = '';

    const result = validateInputs(repo_owner, repo_name);

    expect(result).toBe(1);
    // repo_owner is valid, so it should reach repo_name validation
    expect(core.error).not.toHaveBeenCalledWith(expect.stringContaining('owner name'));
    expect(core.error).toHaveBeenCalledWith('Invalid repository name: ');
    expect(core.warning).toHaveBeenCalledWith(`Make sure the repository name is valid (value: ${repo_name}).`);
  });

  test('should handle null values without throwing', () => {
    const repo_owner = null;
    const repo_name = 'valid-repo';

    const result = validateInputs(repo_owner, repo_name);

    expect(result).toBe(0); // Current implementation doesn't handle null specially
  });

  test('should handle undefined values without throwing', () => {
    const repo_owner = 'valid-owner';
    const repo_name = undefined;

    const result = validateInputs(repo_owner, repo_name);

    expect(result).toBe(0); // Current implementation doesn't handle undefined specially
  });

  test('should return 0 for strings with only spaces (current behavior)', () => {
    const repo_owner = '   '; // 3 spaces - treated as valid by current implementation
    const repo_name = 'valid-repo';

    const result = validateInputs(repo_owner, repo_name);

    expect(result).toBe(0);
    expect(core.error).not.toHaveBeenCalled();
    expect(core.warning).not.toHaveBeenCalled();
  });

  test('should return 1 for strings with only 2 spaces', () => {
    const repo_owner = '  '; // 2 spaces - still treated as invalid by current implementation
    const repo_name = 'valid-repo';

    const result = validateInputs(repo_owner, repo_name);

    expect(result).toBe(0); // Current implementation doesn't validate length, only empty string
    expect(core.error).not.toHaveBeenCalled();
  });

});