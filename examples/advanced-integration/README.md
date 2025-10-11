# Advanced Integration Example

Embed the file explorer in a larger Ink application with multiple screens and state management.

## What it does

- Demonstrates a multi-screen TUI application
- Shows proper state management with React hooks
- Integrates file explorer with other components
- Handles navigation between different views
- Uses `useAlternateScreenBuffer={false}` for embedded mode

## Running

```bash
bun install
bun run index.tsx
```

## Key Integration Techniques

### 1. Disable Alternate Screen Buffer

When embedding in another app, disable the alternate screen buffer:

```tsx
<InkFileExplorer
  useAlternateScreenBuffer={false}
  // ... other props
/>
```

This prevents conflicts with your app's screen management.

### 2. Reserve Top Height

If you have a header or other fixed content, reserve space:

```tsx
<InkFileExplorer
  reservedTopHeight={3}  // Reserve 3 rows for header
  // ... other props
/>
```

### 3. State Management

Use React state to manage which view is shown:

```tsx
const [state, setState] = useState<'menu' | 'selecting' | 'result'>('menu');

// Show different components based on state
if (state === 'menu') return <Menu />;
if (state === 'selecting') return <InkFileExplorer />;
if (state === 'result') return <Result />;
```

### 4. Cleanup

Store the selection result and transition to next view:

```tsx
const handleSelect = (path: string) => {
  setSelectedFile(path);
  setState('result');
};
```

## Architecture Pattern

```
┌─────────────────┐
│   Menu Screen   │
└────────┬────────┘
         │
    ┌────▼────┐
    │  State  │
    └────┬────┘
         │
┌────────▼─────────────┐
│  File Explorer View  │
└──────────────────────┘
         │
    ┌────▼────┐
    │  State  │
    └────┬────┘
         │
┌────────▼─────────┐
│   Result Screen  │
└──────────────────┘
```

## Use Cases

- **File management tools**: Browse, select, and operate on files
- **Configuration wizards**: Multi-step setup with file selection
- **Development tools**: File pickers in larger TUI applications
- **Build tools**: Select source files, output directories, etc.

## Best Practices

1. **Always** set `useAlternateScreenBuffer={false}` when embedding
2. **Reserve space** for your fixed UI elements with `reservedTopHeight`
3. **Manage state** properly to avoid re-mounting the explorer unnecessarily
4. **Handle errors** from the explorer gracefully
5. **Provide clear navigation** back to your main application
6. **Clean up** selection state when navigating away
