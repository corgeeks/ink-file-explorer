# Examples

This directory contains practical examples of using `@corgeeks/ink-file-explorer` in various scenarios.

## Running Examples

All examples can be run with Bun:

```bash
bun run examples/<example-name>/index.tsx
```

Or with Node.js (after installing dependencies):

```bash
node examples/<example-name>/index.tsx
```

## Available Examples

### 1. Basic File Selector
**Path:** `basic-file-selector/`

A simple file selector that logs the selected path. Great starting point for understanding the basics.

```bash
bun run examples/basic-file-selector/index.tsx
```

### 2. Directory Selector
**Path:** `directory-selector/`

Demonstrates selecting directories only (no files), useful for "choose installation directory" type scenarios.

```bash
bun run examples/directory-selector/index.tsx
```

### 3. Filtered File Selector
**Path:** `filtered-selector/`

Shows how to filter files using regex patterns to only show specific file types.

```bash
bun run examples/filtered-selector/index.tsx
```

### 4. Custom File Explorer
**Path:** `custom-explorer/`

Advanced example using the exported hooks (`useFileSystem`, `useSelection`, etc.) to build a custom file explorer UI.

```bash
bun run examples/custom-explorer/index.tsx
```

### 5. Advanced Integration
**Path:** `advanced-integration/`

Demonstrates embedding the file explorer in a larger Ink application with other components.

```bash
bun run examples/advanced-integration/index.tsx
```

## Example Structure

Each example directory contains:
- `index.tsx` - The main example code
- `package.json` - Dependencies for the example
- `README.md` - Specific usage instructions and explanation

## Dependencies

Examples use the local version of `@corgeeks/ink-file-explorer` from the parent directory. To install dependencies for all examples:

```bash
cd examples/<example-name>
bun install
```
