# Filtered File Selector Example

Filter files by type using regex patterns - only show specific file types to users.

## What it does

- Only shows TypeScript and JavaScript files
- Hides all other file types
- Directories are still shown for navigation
- Cannot select directories, only matching files

## Running

```bash
bun install
bun run index.tsx
```

## Code Explanation

```tsx
const fileFilters = [
  /\.tsx?$/,    // .ts or .tsx files
  /\.jsx?$/,    // .js or .jsx files
];

<InkFileExplorer
  fileFilters={fileFilters}
  selectDirectory={false}
  onSelect={(filePath) => {
    console.log('Selected:', filePath);
  }}
/>
```

## Common Filter Patterns

### Source Files
```tsx
const sourceFilters = [
  /\.tsx?$/,
  /\.jsx?$/,
  /\.py$/,
  /\.java$/,
];
```

### Configuration Files
```tsx
const configFilters = [
  /\.json$/,
  /\.yaml$/,
  /\.yml$/,
  /\.toml$/,
  /\.ini$/,
];
```

### Image Files
```tsx
const imageFilters = [
  /\.png$/,
  /\.jpe?g$/,
  /\.gif$/,
  /\.svg$/,
  /\.webp$/,
];
```

### Markdown Files
```tsx
const markdownFilters = [
  /\.md$/,
  /\.markdown$/,
];
```

## Use Cases

- **Config file selector**: "Select a configuration file"
- **Image picker**: "Choose an image to upload"
- **Source file selector**: "Select a TypeScript file to analyze"
- **Document selector**: "Choose a markdown file to edit"

## Behavior

- Directories are always shown (for navigation)
- Files not matching the filter are hidden
- The `.` and `..` entries are always shown
- Status bar shows "[Filtered]" indicator when filters are active
