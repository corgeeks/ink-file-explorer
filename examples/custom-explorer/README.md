# Custom File Explorer Example

Build your own file explorer UI using the exported hooks - complete control over rendering and behavior.

## What it does

- Demonstrates using the library's hooks independently
- Custom UI layout and styling
- Shows how to combine hooks for full control
- Perfect for integrating into existing applications

## Running

```bash
bun install
bun run index.tsx
```

## Exported Hooks Used

### `useFileSystem`
Manages directory reading and navigation:
```tsx
const { currentPath, entries, navigateToPath, error } = useFileSystem(
  process.cwd(),
  showHidden
);
```

### `useFilter`
Handles file filtering with regex support:
```tsx
const { filteredEntries, filterString, setFilterString } = useFilter(entries);
```

### `useSelection`
Manages selection state and navigation:
```tsx
const { selectedIndex, navigateUp, navigateDown } = useSelection(filteredEntries);
```

### `useInputMode`
Tracks input modes (normal, search, etc.):
```tsx
const { mode, enterSearchMode, exitToNormal } = useInputMode();
```

## Customization Ideas

### Different Layout
- Horizontal file list
- Multi-column layout
- Tree view instead of flat list

### Custom Styling
- Different color schemes
- Custom borders and decorations
- Icons for different file types

### Additional Features
- File previews
- File size/date information
- Custom keybindings
- Breadcrumb navigation

### Integration
- Part of a larger TUI application
- Combined with other Ink components
- Custom state management

## Benefits of Using Hooks

1. **Full Control**: Complete control over UI and behavior
2. **Flexibility**: Mix and match with other Ink components
3. **Customization**: Implement your own features easily
4. **Integration**: Easy to integrate into existing apps
5. **Reusability**: Share logic between different UIs

## Hook Composition Pattern

```tsx
// 1. Set up state
const [showHidden, setShowHidden] = useState(false);

// 2. Use hooks in order (following data flow)
const fileSystemResult = useFileSystem(initialPath, showHidden);
const filterResult = useFilter(fileSystemResult.entries);
const selectionResult = useSelection(filterResult.filteredEntries);

// 3. Build custom UI
return <YourCustomUI {...fileSystemResult} {...filterResult} {...selectionResult} />;
```
