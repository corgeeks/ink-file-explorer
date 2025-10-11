# @corgeeks/ink-file-explorer

A vim-inspired file explorer component for [Ink](https://github.com/vadimdemedes/ink), the React-based CLI framework.

## Features

- 🎨 **Full-screen terminal UI** - Uses 100% of terminal space with edge-to-edge layout
- 🔍 **Scrollable file list** - Smooth scrolling with viewport management for large directories
- ⌨️ **Dual input modes** - Windows-style (arrow keys) or Vim-style (hjkl) keybindings
- 📱 **Responsive design** - Adapts to small terminals (< 10 rows) with minimal mode
- 🖥️ **Alternate screen buffer** - Vim-like behavior that preserves terminal history
- 🎯 **Smart dialogs** - Create files/directories, rename, and search with unified bottom bar
- 💾 **Scroll position memory** - Remembers scroll position per directory
- 🔎 **File filtering** - Regex-based search and file type filters

## Installation

```bash
# Using bun
bun add @corgeeks/ink-file-explorer

# Using npm
npm install @corgeeks/ink-file-explorer

# Using pnpm
pnpm add @corgeeks/ink-file-explorer
```

## Quick Start

### Demo Application

Run the included demo:

```bash
bun run src/main.tsx
```

With options:

```bash
# Vim mode
bun run src/main.tsx --vim

# Start in specific directory
bun run src/main.tsx --start-path /path/to/dir

# Filter files (regex)
bun run src/main.tsx --filter "\.tsx?$"
```

### As a Library Component

```tsx
import { InkFileExplorer } from '@corgeeks/ink-file-explorer';
import { render } from 'ink';

render(
  <InkFileExplorer
    onSelect={(path) => {
      console.log('Selected:', path);
      process.exit(0);
    }}
  />
);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSelect` | `(path: string) => void` | **required** | Callback when a file or directory is selected |
| `selectFile` | `boolean` | `true` | Allow file selection |
| `selectDirectory` | `boolean` | `true` | Allow directory selection |
| `closeOnSelection` | `boolean` | `true` | Close explorer after selection |
| `vimMode` | `boolean` | `false` | Use vim-style keybindings (j/k/h/l) |
| `initialPath` | `string` | `process.cwd()` | Starting directory path |
| `fileFilters` | `RegExp[]` | `[]` | Array of regex patterns to filter files |
| `useAlternateScreenBuffer` | `boolean` | `true` | Use alternate screen buffer (vim-like) |

### Library Usage

When embedding in another Ink application, disable the alternate screen buffer:

```tsx
<InkFileExplorer
  useAlternateScreenBuffer={false}
  onSelect={handleSelect}
/>
```

## Keybindings

### Windows Mode (Default)

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate up/down |
| `Enter` | Select file/directory or navigate into directory |
| `Backspace` | Go to parent directory |
| `Ctrl+H` | Toggle hidden files |
| `Ctrl+F` | Open search |
| `Ctrl+N` | Create new file |
| `Ctrl+D` | Create new directory |
| `F2` | Rename selected item |
| `Esc` | Clear search filter |

### Vim Mode

| Key | Action |
|-----|--------|
| `j` / `k` | Navigate down/up |
| `l` / `Enter` | Select file/directory or navigate into directory |
| `h` | Go to parent directory |
| `/` | Open search (always regex mode) |
| `R` | Rename selected item |
| `Esc` | Clear search filter |

## Architecture

### Full-Screen Layout

The component uses the entire terminal screen:
- **File list area**: Fills available vertical space with scrolling
- **Bottom bar**: Unified status line and input dialogs
- **Responsive**: Adapts to terminal resize events automatically

### Viewport & Scrolling

- Only visible entries are rendered (viewport window)
- Scroll position persists when navigating between directories
- Shows indicators when there's more content above/below
- Automatically scrolls to keep selection visible

### Minimal Mode

When terminal height < 10 rows:
- Removes all styling and colors
- Hides status bar in normal mode
- Shows only essential file list
- Dialogs still appear for user input

### Alternate Screen Buffer

Like vim, the explorer runs on a separate screen:
- Terminal history is preserved
- Original screen restored on exit
- Can be disabled for embedded usage

**Important**: When using the component standalone (not embedded), activate the alternate screen buffer **before** calling `render()`:

```tsx
// Enter alternate screen buffer
process.stdout.write('\x1b[?1049h\x1b[2J\x1b[H');

// Render the component with alternate buffer disabled
const { unmount } = render(
  <InkFileExplorer
    useAlternateScreenBuffer={false}
    onSelect={(path) => {
      // Restore main screen buffer
      process.stdout.write('\x1b[?1049l');
      console.log('Selected:', path);
      process.exit(0);
    }}
  />
);

// Handle cleanup
process.on('SIGINT', () => {
  unmount();
  process.stdout.write('\x1b[?1049l');
  process.exit(0);
});
```

This ensures the screen is saved before Ink starts rendering, preventing artifacts on the main screen.

## Examples

Comprehensive examples are available in the `examples/` directory. See the [Examples README](./examples/README.md) for details.

### Quick Examples

#### Basic File Selector

```tsx
import { InkFileExplorer } from '@corgeeks/ink-file-explorer';
import { render } from 'ink';

render(
  <InkFileExplorer
    onSelect={(path) => {
      console.log('You selected:', path);
      process.exit(0);
    }}
  />
);
```

#### Directory-Only Selector

```tsx
<InkFileExplorer
  selectFile={false}
  selectDirectory={true}
  onSelect={(dir) => console.log('Directory:', dir)}
/>
```

#### With File Filters

```tsx
<InkFileExplorer
  fileFilters={[/\.tsx?$/, /\.jsx?$/]}
  onSelect={(file) => console.log('TypeScript/JavaScript file:', file)}
/>
```

#### Vim Mode

```tsx
<InkFileExplorer
  vimMode={true}
  onSelect={(path) => console.log('Selected (vim mode):', path)}
/>
```

### Available Examples

- **[basic-file-selector](./examples/basic-file-selector)** - Simple file selection
- **[directory-selector](./examples/directory-selector)** - Directory-only selection
- **[filtered-selector](./examples/filtered-selector)** - File type filtering
- **[custom-explorer](./examples/custom-explorer)** - Custom UI with hooks
- **[advanced-integration](./examples/advanced-integration)** - Embedded in larger app

## API Reference

### Component: InkFileExplorer

The main file explorer component with full UI and interaction handling.

```tsx
import { InkFileExplorer } from '@corgeeks/ink-file-explorer';
```

### Exported Sub-Components

For advanced customization, you can use the sub-components directly:

```tsx
import { FileList, BottomBar } from '@corgeeks/ink-file-explorer';
```

- **FileList** - Scrollable file list with viewport management
- **BottomBar** - Unified status line and input dialogs

### Exported Hooks

Build custom file explorers using the provided hooks:

```tsx
import {
  useFileSystem,
  useSelection,
  useFilter,
  useInputMode,
  useTerminalSize,
} from '@corgeeks/ink-file-explorer';
```

#### `useFileSystem(initialPath, showHidden)`

Manages directory reading and navigation.

**Parameters:**
- `initialPath: string` - Starting directory path
- `showHidden: boolean` - Whether to show hidden files

**Returns:**
```tsx
{
  currentPath: string;
  entries: FileEntry[];
  isLoading: boolean;
  error: FileSystemError | null;
  navigateToPath: (path: string) => void;
  refresh: () => void;
}
```

#### `useSelection(entries)`

Manages selection state with bounds checking.

**Parameters:**
- `entries: FileEntry[]` - Array of entries to select from

**Returns:**
```tsx
{
  selectedIndex: number;
  navigateUp: () => void;
  navigateDown: () => void;
  setIndex: (index: number) => void;
  reset: () => void;
}
```

#### `useFilter(entries)`

Filters entries with regex support.

**Parameters:**
- `entries: FileEntry[]` - Array of entries to filter

**Returns:**
```tsx
{
  filterString: string;
  filteredEntries: FileEntry[];
  setFilterString: (filter: string) => void;
  clearFilter: () => void;
  isActive: boolean;
}
```

#### `useInputMode(initialMode?)`

Tracks current input mode (normal, search, etc.).

**Parameters:**
- `initialMode?: InputMode` - Initial mode (default: 'normal')

**Returns:**
```tsx
{
  mode: InputMode;
  setMode: (mode: InputMode) => void;
  enterSearchMode: () => void;
  enterCreateFileMode: () => void;
  enterCreateDirMode: () => void;
  enterRenameMode: () => void;
  enterErrorMode: () => void;
  exitToNormal: () => void;
}
```

#### `useTerminalSize()`

Detects terminal dimensions and responds to resize events.

**Returns:**
```tsx
{
  width: number;
  height: number;
  isMinimal: boolean;  // true if height < 10
}
```

### Type Exports

```tsx
import type {
  FileExplorerProps,
  FileEntry,
  FileSystemError,
  InputMode,
  DirectoryReadResult,
  FileListProps,
  BottomBarProps,
  UseFileSystemResult,
  UseSelectionResult,
  UseFilterResult,
  UseInputModeResult,
  TerminalSize,
} from '@corgeeks/ink-file-explorer';
```

## Advanced Usage

### Building a Custom File Explorer

Use the exported hooks to build completely custom UIs:

```tsx
import { useFileSystem, useSelection, useFilter } from '@corgeeks/ink-file-explorer';

function MyCustomExplorer() {
  const { entries, currentPath, navigateToPath } = useFileSystem(process.cwd(), false);
  const { filteredEntries, setFilterString } = useFilter(entries);
  const { selectedIndex, navigateUp, navigateDown } = useSelection(filteredEntries);

  // Build your own custom UI here
  return <YourCustomUI />;
}
```

See the [custom-explorer example](./examples/custom-explorer) for a complete implementation.

### Embedding in Larger Applications

When embedding in another Ink application:

1. Set `useAlternateScreenBuffer={false}`
2. Use `reservedTopHeight` for fixed headers
3. Manage state properly to avoid re-renders

```tsx
<InkFileExplorer
  useAlternateScreenBuffer={false}
  reservedTopHeight={3}
  onSelect={handleSelect}
/>
```

See the [advanced-integration example](./examples/advanced-integration) for details.

### Prop-Types Runtime Validation

All components include prop-types for runtime validation in development:

```tsx
// Invalid usage will show warnings in development
<InkFileExplorer onSelect="invalid" />  // Warning: onSelect should be a function
```

## Development

### Running Tests

```bash
bun test
```

### Project Structure

```
src/
├── components/
│   ├── InkFileExplorer.tsx  # Main component
│   ├── FileList.tsx          # File list with viewport
│   ├── BottomBar.tsx         # Unified status/input bar
│   ├── StatusLine.tsx        # (deprecated)
│   └── InputOverlay.tsx      # (deprecated)
├── lib/
│   ├── hooks/
│   │   ├── useFileSystem.ts     # Directory reading
│   │   ├── useSelection.ts      # Selection management
│   │   ├── useFilter.ts         # Search filtering
│   │   ├── useInputMode.ts      # Input mode switching
│   │   └── useTerminalSize.ts   # Terminal dimensions
│   └── fileSystem.ts            # File operations
├── types/
│   └── index.ts                 # TypeScript definitions
└── main.tsx                     # Demo application
```

## Contributing

This project uses [Bun](https://bun.com) as the JavaScript runtime.

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Run tests: `bun test`
5. Submit a pull request

## License

MIT

## Credits

Built with [Ink](https://github.com/vadimdemedes/ink) by Vadim Demedes.

Inspired by vim's netrw file explorer.
