# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

### 1. GitHub Security Advisories (Preferred)

1. Go to the [Security tab](https://github.com/corgeek/ink-file-explorer/security/advisories)
2. Click "Report a vulnerability"
3. Fill out the advisory form with details

### 2. Email

Send an email to: security@corgeeks.net

Include the following information:
- Type of vulnerability
- Full paths of affected source files
- Location of the affected code (tag/branch/commit/URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 5 business days
- **Fix timeline:** Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Best effort

### Our Commitment

- We will confirm receipt of your vulnerability report
- We will work to fix verified vulnerabilities in a timely manner
- We will credit you in the security advisory (unless you prefer to remain anonymous)
- We will keep you informed about our progress

## Security Measures

This project implements several security measures:

### Development

- **Dependency scanning** via Dependabot and Renovate
- **Secret scanning** to prevent credential leaks
- **Automated security updates** for vulnerable dependencies
- **Code scanning** with Trivy for container and filesystem vulnerabilities

### CI/CD

- **Locked dependencies** (`bun.lock`) for reproducible builds
- **Security audits** run on every push to main
- **Signed commits** encouraged for verification
- **Provenance attestation** for npm packages

### Runtime

- **Type safety** with TypeScript
- **Input validation** with PropTypes
- **Minimal dependencies** to reduce attack surface
- **No eval() or dynamic code execution**

## Best Practices for Users

When using this package:

1. **Keep it updated** to get the latest security patches
2. **Review dependencies** periodically with `bun pm audit`
3. **Use lockfiles** to ensure consistent dependency versions
4. **Follow principle of least privilege** when granting file system access
5. **Sanitize user inputs** before passing to file operations

## Known Security Considerations

### File System Access

This package reads and writes to the file system. When using it:

- Always validate user-provided paths
- Be cautious with symbolic links
- Consider running in a sandboxed environment for untrusted inputs
- Use file filters to restrict access to sensitive directories

### Terminal Input

The package handles terminal input directly. Security considerations:

- Input is not executed as shell commands
- File paths are validated before operations
- Regex patterns in filters should be from trusted sources

## Disclosure Policy

When we receive a security report:

1. **Verify** the vulnerability
2. **Develop a fix** in a private branch
3. **Test the fix** thoroughly
4. **Prepare a security advisory**
5. **Release the patch** and publish the advisory
6. **Credit the reporter** (if they agree)

Security advisories will be published on:
- GitHub Security Advisories
- npm security advisories
- Project release notes

## Security Tooling

We use the following tools to maintain security:

- **Dependabot** - Automated dependency updates
- **Renovate** - Advanced dependency management
- **Trivy** - Vulnerability scanning
- **CodeQL** - Code analysis (planned)
- **npm audit** - Package vulnerability checking

## Compliance

This project aims to follow:

- [OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)

## Bug Bounty

We currently do not offer a bug bounty program. However, we greatly appreciate responsible disclosure and will credit researchers in our security advisories.

## Contact

For general security questions: security@corgeeks.net

For vulnerability reports: Use GitHub Security Advisories or email above

---

Thank you for helping keep @corgeeks/ink-file-explorer and its users safe!
