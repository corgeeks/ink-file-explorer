// File system entity types

export interface FileEntry {
	name: string;
	path: string;
	isDirectory: boolean;
	isHidden: boolean;
	isSpecial: boolean; // for . and ..
}

export interface FileSystemError {
	type: 'permission' | 'not_found' | 'invalid_name' | 'already_exists' | 'unknown';
	message: string;
	path?: string;
}

export interface DirectoryReadResult {
	entries: FileEntry[];
	error?: FileSystemError;
}

// Component props types

/**
 * Props for the InkFileExplorer component.
 *
 * @example
 * ```tsx
 * <InkFileExplorer
 *   vimMode={true}
 *   onSelect={(path) => console.log('Selected:', path)}
 * />
 * ```
 */
export interface FileExplorerProps {
	/** Allow file selection (default: true) */
	selectFile?: boolean;

	/** Allow directory selection (default: true) */
	selectDirectory?: boolean;

	/** Close/exit the explorer after selection (default: true) */
	closeOnSelection?: boolean;

	/** Array of RegExp patterns to filter visible files */
	fileFilters?: RegExp[];

	/** Use vim-style keybindings (j/k/h/l) instead of arrow keys (default: false) */
	vimMode?: boolean;

	/** Callback when a file or directory is selected */
	onSelect: (path: string) => void;

	/** Starting directory path (default: process.cwd()) */
	initialPath?: string;

	/**
	 * Use alternate screen buffer for vim-like behavior (default: true).
	 * When true, the explorer runs on a separate screen and restores the terminal on exit.
	 * Set to false when embedding in another Ink application to avoid screen conflicts.
	 */
	useAlternateScreenBuffer?: boolean;

	/**
	 * Reserved height at the top of the screen (default: 0).
	 * Use this when wrapping the component with a header or other top content.
	 * The file list viewport will account for this reserved space.
	 * @internal - primarily for demo/wrapper usage
	 */
	reservedTopHeight?: number;
}

export type InputMode = 'normal' | 'search' | 'create-file' | 'create-dir' | 'rename' | 'error';

export interface CommandAction {
	type: ActionType;
	payload?: unknown;
}

export enum ActionType {
	NAVIGATE_UP = 'NAVIGATE_UP',
	NAVIGATE_DOWN = 'NAVIGATE_DOWN',
	SELECT = 'SELECT',
	GO_PARENT = 'GO_PARENT',
	ENTER_DIR = 'ENTER_DIR',
	TOGGLE_HIDDEN = 'TOGGLE_HIDDEN',
	ENTER_SEARCH_MODE = 'ENTER_SEARCH_MODE',
	ENTER_CREATE_FILE_MODE = 'ENTER_CREATE_FILE_MODE',
	ENTER_CREATE_DIR_MODE = 'ENTER_CREATE_DIR_MODE',
	ENTER_RENAME_MODE = 'ENTER_RENAME_MODE',
	CANCEL = 'CANCEL',
	CONFIRM = 'CONFIRM',
}
