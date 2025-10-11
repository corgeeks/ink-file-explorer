// Main component export
export { InkFileExplorer } from './components/InkFileExplorer.js';

// Sub-component exports for advanced usage
export { BottomBar } from './components/BottomBar.js';
export { FileList } from './components/FileList.js';

// Custom hooks for building custom file explorers
export {
	useFileSystem,
	useFilter,
	useInputMode,
	useSelection,
	useTerminalSize,
} from './lib/hooks/index.js';

// Type exports - Component props
export type {
	DirectoryReadResult,
	FileEntry,
	FileExplorerProps,
	FileSystemError,
	InputMode,
} from './types/index.js';

// Type exports - Component prop interfaces
export type { BottomBarProps } from './components/BottomBar.js';
export type { FileListProps } from './components/FileList.js';

// Type exports - Hook return types
export type {
	TerminalSize,
	UseFileSystemResult,
	UseFilterResult,
	UseInputModeResult,
	UseSelectionResult,
} from './lib/hooks/index.js';
