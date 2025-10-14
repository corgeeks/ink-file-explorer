# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 (2025-10-14)


### Features

* get production ready ([f7a1eef](https://github.com/corgeeks/ink-file-explorer/commit/f7a1eef69b34750570427e94fe0b71ba5211eb5a))
* the first commit ([064fc53](https://github.com/corgeeks/ink-file-explorer/commit/064fc53e9562379a37d0f37cf5562b5300473a49))


### Bug Fixes

* dependabot to use bun ecosystem, not npm ([9140994](https://github.com/corgeeks/ink-file-explorer/commit/9140994b9fc7d9ee73aacc1c56cb8045f9f4e0c1))
* enable labels ([4695398](https://github.com/corgeeks/ink-file-explorer/commit/4695398c7b139575e141715ce2756ab9c931d468))
* update workflow permissions ([fe1c94f](https://github.com/corgeeks/ink-file-explorer/commit/fe1c94f3be90a66919f5aa508c27cc3e2cf9fe1d))

## [Unreleased]

### Added
- Initial release of @corgeeks/ink-file-explorer
- Full-screen terminal UI with vim-inspired file explorer
- Dual input modes: Windows-style (arrow keys) and Vim-style (hjkl)
- Scrollable file list with viewport management
- Responsive design with minimal mode for small terminals
- Alternate screen buffer support (vim-like behavior)
- Smart dialogs for creating files/directories, renaming, and searching
- Scroll position memory per directory
- Regex-based file filtering
- Exported sub-components: FileList, BottomBar
- Exported hooks: useFileSystem, useSelection, useFilter, useInputMode, useTerminalSize
- PropTypes runtime validation
- Comprehensive JSDoc documentation
- 5 complete examples demonstrating various use cases
- Test suite with 88 tests and 73% coverage
- CI/CD pipeline with GitHub Actions
- Automated releases with Release Please
- Security scanning with Trivy
- Dependency updates with Renovate and Dependabot

### Documentation
- Comprehensive README with API reference
- CONTRIBUTING guide for contributors
- SECURITY policy for vulnerability reporting
- Repository settings documentation
- Issue and PR templates
- Code owners configuration

## [0.1.0] - TBD

Initial development release (not yet published).
