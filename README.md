# 🏷️ GitHub Properties as Envs

[![CI/CD](https://github.com/GoDllkE/github-properties-as-envs/actions/workflows/cicd-workflow.yml/badge.svg?branch=main)](https://github.com/GoDllkE/github-properties-as-envs/actions/workflows/cicd-workflow.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=GoDllkE_github-properties-as-envs&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=GoDllkE_github-properties-as-envs)

> **A GitHub Action to retrieve and validate custom repository properties, exporting them as outputs for your workflows.**

---

## 📋 Table of Contents

- [Features](#features)
- [Usage](#usage)
  - [Basic Example](#basic-example)
  - [Available Outputs](#available-outputs)
- [Inputs](#inputs)
- [Use Cases](#use-cases)
- [Development](#development)
- [Testing](#testing)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 🚀 Features

- Retrieve custom properties from GitHub repositories
- Export properties as step-outputs for use in subsequent workflow steps
- Structured logs for debugging
- 100% test coverage with Jest

---

## 🔧 Usage

### Basic Example

```yaml
- name: Retrieve Custom Properties
  id: gca-properties
  uses: GoDllkE/github-properties-as-envs@v1.0.0
  with:
    github_token: ${{ secrets.some_personal_access_token }}
    repository_owner: ${{ github.repository_owner }}
    repository_name: ${{ github.event.repository.name }}
    validate_properties: true

- name: Use Properties (example property values)
  run: |
    echo "Deploy: ${{ steps.gca-properties.outputs.deploy }}"
    echo "Framework: ${{ steps.gca-properties.outputs.framework }}"
    echo "Manager: ${{ steps.gca-properties.outputs.manager }}"
    echo "Infrastructure: ${{ steps.gca-properties.outputs.infrastructure }}"
    echo "Language: ${{ steps.gca-properties.outputs.language }}"
    echo "Project: ${{ steps.gca-properties.outputs.project }}"
    echo "OtherProperty: ${{ steps.gca-properties.outputs.otherproperty }}"
```

## ⚙️ Inputs

| Input                | Required | Default | Description                                  |
|----------------------|----------|---------|----------------------------------------------|
| `github_token`       | Yes      | -       | GitHub token (PAT recommended)               |
| `repository_owner`   | Yes      | -       | Repository owner                             |
| `repository_name`    | Yes      | -       | Repository name                              |


## 🎯 Use Cases

- **Reusable Workflows:** Centralize property management for multiple repositories.
- **CI/CD Automation:** Use exported properties for deployment, notifications, and more.

---

## 🛠️ Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [npm](https://npmjs.com/) 8+
- [Git](https://git-scm.com/)

### Setup

```bash
git clone https://github.com/GoDllkE/github-properties-as-envs.git
cd github-properties-as-envs
npm install
npm run prepare
```

### Build

```bash
npm run build
```

---

## 🧪 Testing

- 100% code coverage with Jest
- Unit and integration tests for all core functions

```bash
npm test
```

Test structure:

```
tests/
├── main.test.js
├── getRepositoryProperties.test.js
├── validateInputs.test.js
├── exportGithubOutput.test.js
├── validateCredentials.test.js
├── filterRepoProperties.test.js
├── main.test.js
```

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](.github/CONTRIBUTING.MD) for guidelines.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👥 Support

- Email [me](mailto:gustavot53@gmail.com)
- [GitHub Issues](https://github.com/GoDllkE/github-properties-as-envs/issues)
- [GitHub Discussions](https://github.com/GoDllkE/github-properties-as_envs/discussions)

---

<div align="center">

Made with ❤️ by GoDllkE

[⭐ Star this project](https://github.com/GoDllkE/github-properties-as_envs) • [📝 Report a bug](https://github.com/GoDllkE/github-properties-as_envs/issues) • [💡 Suggest a feature](https://github.com/GoDllkE/github-properties-as_envs/discussions)

</div>
