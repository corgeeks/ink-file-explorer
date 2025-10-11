# Basic File Selector Example

The simplest possible use case for `@corgeeks/ink-file-explorer`.

## What it does

- Opens a file explorer in the current directory
- Allows browsing files and directories with arrow keys
- Logs the selected path when you press Enter
- Exits the application

## Running

```bash
bun install
bun run index.tsx
```

## Code Explanation

```tsx
<InkFileExplorer
  onSelect={(path) => {
    console.log('You selected:', path);
    process.exit(0);
  }}
/>
```

The only required prop is `onSelect`, which is called when the user selects a file or directory.

## Default Behavior

- **Initial path:** Current working directory
- **Selection mode:** Both files and directories can be selected
- **Close on selection:** Yes (component exits after selection)
- **Input mode:** Arrow keys (Windows mode)
- **Alternate screen buffer:** Yes (like vim, preserves terminal history)

## Keybindings

- **↑/↓**: Navigate up/down
- **Enter**: Select file/directory or enter directory
- **Backspace**: Go to parent directory
- **Ctrl+H**: Toggle hidden files
- **Ctrl+F**: Search
- **Esc**: Clear search
