# Directory-Only Selector Example

Select directories but not files - useful for installation wizards, project setup, etc.

## What it does

- Shows files and directories, but only directories can be selected
- Files are displayed but cannot be selected (pressing Enter does nothing)
- Perfect for "Choose installation directory" type scenarios

## Running

```bash
bun install
bun run index.tsx
```

## Code Explanation

```tsx
<InkFileExplorer
  selectFile={false}        // Disable file selection
  selectDirectory={true}    // Enable directory selection
  onSelect={(directoryPath) => {
    console.log('Selected directory:', directoryPath);
  }}
/>
```

## Use Cases

- **Installation directory selection**: "Where should we install the application?"
- **Project location**: "Select a folder for your new project"
- **Backup destination**: "Choose where to save backups"
- **Output directory**: "Select output directory for generated files"

## Behavior

- Pressing Enter on a file does nothing (no visual feedback)
- Pressing Enter on a directory:
  - If it's `.` (current dir): Selects the current directory
  - If it's `..` (parent): Navigates to parent
  - If it's a subdirectory: Navigates into it
- To select the current directory: Navigate to it and select the `.` entry
