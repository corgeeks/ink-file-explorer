# GitHub Repository Settings

This document outlines the recommended GitHub repository settings for production use.

## Branch Protection Rules

### Main Branch Protection

Navigate to: `Settings > Branches > Branch protection rules > Add rule`

**Branch name pattern:** `main`

**Protection settings:**

- [x] **Require a pull request before merging**
  - [x] Require approvals: 1
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners (if CODEOWNERS file exists)

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - **Required status checks:**
    - `Validate PR / validate`
    - `Test and Build / test`
    - `Security Scan / security`

- [x] **Require conversation resolution before merging**

- [x] **Require signed commits** (recommended for security)

- [x] **Require linear history** (optional, enforces clean git history)

- [x] **Include administrators** (recommended)

- [ ] **Allow force pushes** (keep disabled)

- [ ] **Allow deletions** (keep disabled)

## Repository Settings

### General

Navigate to: `Settings > General`

**Features:**
- [x] Wikis (disabled - use docs/ directory instead)
- [x] Issues (enabled)
- [x] Sponsorships (optional)
- [x] Projects (optional)
- [x] Discussions (optional - for community)

**Pull Requests:**
- [x] Allow squash merging
- [ ] Allow merge commits (disabled for clean history)
- [ ] Allow rebase merging (disabled)
- [x] Always suggest updating pull request branches
- [x] Automatically delete head branches

### Security

Navigate to: `Settings > Security > Code security and analysis`

**Dependency graph:**
- [x] Enable dependency graph

**Dependabot:**
- [x] Dependabot alerts
- [x] Dependabot security updates

**Code scanning:**
- [x] CodeQL analysis (configure via workflow)
- [x] Trivy security scanning (configured in ci.yml)

**Secret scanning:**
- [x] Secret scanning
- [x] Push protection (prevents committing secrets)

### Secrets and Variables

Navigate to: `Settings > Secrets and variables > Actions`

**Required secrets:**
- `NPM_TOKEN` - npm authentication token for publishing
  - Create at: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
  - Type: Automation token
  - Scope: Read and Publish

**Optional secrets:**
- `CODECOV_TOKEN` - Codecov integration for coverage reports
  - Get from: https://codecov.io/
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

### GitHub Pages (Optional)

Navigate to: `Settings > Pages`

**If you want to host documentation:**
- Source: GitHub Actions
- Custom domain: (optional)

### Notifications

Navigate to: `Settings > Notifications`

**Recommended settings:**
- [x] Email notifications for PR reviews
- [x] Web notifications for mentions
- [x] Dependabot alerts

## Integrations

### Renovate Bot

1. Install Renovate from GitHub Marketplace
2. Enable for this repository
3. Configuration is in `.github/renovate.json`

**Benefits:**
- Automated dependency updates
- Grouped updates for related packages
- Automatic merging of minor updates
- Security vulnerability alerts

### Codecov (Optional)

1. Sign up at https://codecov.io/
2. Connect your GitHub account
3. Enable for this repository
4. Add `CODECOV_TOKEN` to repository secrets

**Benefits:**
- Visual coverage reports
- PR coverage comments
- Coverage trends over time

## Rulesets (Advanced)

Navigate to: `Settings > Rules > Rulesets`

**Create a ruleset for additional controls:**
- Restrict file path changes (e.g., `.github/workflows/*.yml` requires admin approval)
- Restrict file extensions
- Commit message requirements
- Metadata restrictions

## Team Access (Organization Repos)

Navigate to: `Settings > Collaborators and teams`

**Recommended roles:**
- **Admin:** Repository owners
- **Maintain:** Core maintainers (can merge PRs)
- **Write:** Contributors (can push to branches)
- **Triage:** Issue managers (can label, assign)
- **Read:** Public access

## Actions Permissions

Navigate to: `Settings > Actions > General`

**Actions permissions:**
- [x] Allow all actions and reusable workflows

**Workflow permissions:**
- [x] Read and write permissions
- [x] Allow GitHub Actions to create and approve pull requests (for Release Please)

**Fork pull request workflows:**
- [x] Require approval for first-time contributors

## Webhooks (Optional)

Navigate to: `Settings > Webhooks`

**Useful webhooks for integrations:**
- Slack/Discord notifications
- CI/CD triggers
- Deployment automation

## API Access

**Required for automated releases:**
- Release Please needs `contents: write` and `pull-requests: write` permissions
- These are configured in the workflow files

## Security Best Practices

1. **Enable Dependabot** for automated security updates
2. **Require code reviews** before merging
3. **Enable secret scanning** with push protection
4. **Use signed commits** to verify authenticity
5. **Restrict who can push to main** via branch protection
6. **Regular security audits** via `bun pm audit`
7. **Keep dependencies updated** with Renovate

## Checklist for Production

Before releasing to production, verify:

- [x] Branch protection on main branch
- [x] Required status checks configured
- [x] NPM_TOKEN secret added
- [x] Renovate bot enabled
- [x] Dependabot alerts enabled
- [x] Secret scanning enabled
- [x] PR template in place
- [x] Issue templates configured
- [x] CONTRIBUTING.md exists
- [x] Repository description and topics set

## Regular Maintenance

**Weekly:**
- Review and merge Renovate PRs
- Check Dependabot alerts

**Monthly:**
- Review security advisories
- Update documentation
- Check and improve test coverage

**Per Release:**
- Review changelog
- Test npm package installation
- Verify examples work
- Update version in documentation if needed
