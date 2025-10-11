// Main component export
export { InkFileExplorer } from './components/InkFileExplorer.js';

// Sub-component exports for advanced usage
export { FileList } from './components/FileList.js';
export { BottomBar } from './components/BottomBar.js';

// Custom hooks for building custom file explorers
export {
	useFileSystem,
	useSelection,
	useFilter,
	useInputMode,
	useTerminalSize,
} from './lib/hooks/index.js';

// Type exports - Component props
export type {
	FileExplorerProps,
	FileEntry,
	FileSystemError,
	InputMode,
	DirectoryReadResult,
} from './types/index.js';

// Type exports - Component prop interfaces
export type { FileListProps } from './components/FileList.js';
export type { BottomBarProps } from './components/BottomBar.js';

// Type exports - Hook return types
export type {
	UseFileSystemResult,
	UseSelectionResult,
	UseFilterResult,
	UseInputModeResult,
	TerminalSize,
} from './lib/hooks/index.js';
