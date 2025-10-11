# Contributing to @corgeeks/ink-file-explorer

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) - JavaScript runtime and bundler
- Git
- A GitHub account

### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ink-file-explorer.git
   cd ink-file-explorer
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

4. Run the demo to verify setup:
   ```bash
   bun run src/main.tsx
   ```

## Development Workflow

### Running Tests

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch
```

### Building

```bash
# Build the package
bun run build

# Clean build artifacts
bun run clean
```

### Type Checking

```bash
bun run type-check
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/` - New features (e.g., `feature/add-directory-icons`)
- `fix/` - Bug fixes (e.g., `fix/scroll-position-reset`)
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(search): add regex mode for file filtering
fix(scroll): preserve position when navigating directories
docs(readme): update installation instructions
```

### Code Style

- Use TypeScript for all code
- Follow existing code style and patterns
- Add JSDoc comments to public APIs
- Add PropTypes validation to components
- Keep functions focused and testable

### Testing Requirements

- Write tests for new features and bug fixes
- Maintain or improve code coverage (target: 80%)
- Ensure all tests pass before submitting PR
- Test both Windows and Vim keybinding modes when applicable

### Documentation Requirements

When adding or changing features:

1. **Update JSDoc comments** in the code
2. **Update README.md** if the API changes
3. **Update or add examples** in `examples/` directory
4. **Add PropTypes** for new component props
5. **Update CLAUDE.md** if changing development patterns

See the "Documentation Maintenance" section in CLAUDE.md for detailed guidelines.

## Pull Request Process

1. **Create a PR** from your fork to the main repository
2. **Fill out the PR template** completely
3. **Ensure CI passes** (tests, build, type checking)
4. **Request review** from maintainers
5. **Address feedback** and update your PR as needed
6. **Squash commits** if requested before merging

### PR Checklist

- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Code follows project style
- [ ] Commit messages follow conventional commits
- [ ] No breaking changes (or clearly documented)
- [ ] Examples updated if API changed
- [ ] PropTypes added for new props

## Release Process

Releases are automated using [Release Please](https://github.com/googleapis/release-please):

1. Changes merged to `main` trigger Release Please
2. Release Please creates/updates a release PR
3. When the release PR is merged:
   - Version is bumped
   - CHANGELOG is updated
   - GitHub release is created
   - Package is published to npm

## Project Structure

```
ink-file-explorer/
├── .github/              # GitHub Actions workflows and templates
├── src/
│   ├── components/       # React components
│   ├── lib/
│   │   ├── hooks/        # Custom React hooks
│   │   └── fileSystem.ts # File operations
│   ├── types/            # TypeScript type definitions
│   └── main.tsx          # Demo application
├── examples/             # Usage examples
├── dist/                 # Built files (gitignored)
└── coverage/             # Test coverage reports (gitignored)
```

## Getting Help

- 📖 Check the [README.md](./README.md) for usage documentation
- 💡 Browse [examples](./examples/) for implementation patterns
- 🐛 Search [existing issues](https://github.com/corgeek/ink-file-explorer/issues)
- 💬 Open a new issue for questions or discussions

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- README acknowledgments (for major features)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
