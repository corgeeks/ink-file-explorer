import { Box, useInput } from 'ink';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect,useMemo, useRef, useState } from 'react';

import { createDirectory, createFile, renameFileOrDirectory } from '../lib/fileSystem.js';
import { useFileSystem, useFilter, useInputMode, useSelection, useTerminalSize } from '../lib/hooks/index.js';
import type { FileExplorerProps } from '../types/index.js';
import { BottomBar } from './BottomBar.js';
import { FileList } from './FileList.js';

/**
 * A vim-inspired file explorer component for Ink CLI applications.
 *
 * Provides a full-screen terminal UI for browsing and selecting files and directories,
 * with support for dual input modes (Windows-style arrow keys or Vim-style hjkl),
 * scrollable file lists, and smart dialogs for file operations.
 *
 * @example
 * ```tsx
 * import { InkFileExplorer } from '@corgeeks/ink-file-explorer';
 * import { render } from 'ink';
 *
 * render(
 *   <InkFileExplorer
 *     onSelect={(path) => {
 *       console.log('Selected:', path);
 *       process.exit(0);
 *     }}
 *   />
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Vim mode with file filters
 * <InkFileExplorer
 *   vimMode={true}
 *   fileFilters={[/\.tsx?$/, /\.jsx?$/]}
 *   onSelect={(file) => console.log('Selected:', file)}
 * />
 * ```
 *
 * @param props - Component properties
 * @returns A rendered file explorer component
 */
export function InkFileExplorer(props: FileExplorerProps) {
	const {
		selectFile = true,
		selectDirectory = true,
		closeOnSelection: _closeOnSelection = true,
		fileFilters = [],
		vimMode = false,
		onSelect,
		initialPath = process.cwd(),
		useAlternateScreenBuffer = true,
		reservedTopHeight = 0,
	} = props;

	// State management
	const [showHidden, setShowHidden] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [overlayInput, setOverlayInput] = useState('');
	const [itemToRename, setItemToRename] = useState<string | null>(null);

	// Get terminal size for responsive layout
	const terminalSize = useTerminalSize();

	// Scroll position management
	const [scrollOffset, setScrollOffset] = useState(0);
	const scrollPositions = useRef<Map<string, number>>(new Map());

	const { currentPath, entries, isLoading: _isLoading, error: fsError, navigateToPath, refresh } = useFileSystem(initialPath, showHidden);
	const { mode, setMode: _setMode, enterSearchMode, enterCreateFileMode, enterCreateDirMode, enterRenameMode, enterErrorMode, exitToNormal } = useInputMode();
	const { filterString, filteredEntries, setFilterString, clearFilter } = useFilter(entries);

	// Apply file filters from props
	const finalEntries = useMemo(() => {
		if (fileFilters.length === 0) {
			return filteredEntries;
		}

		return filteredEntries.filter((entry) => {
			// Always keep special entries and directories
			if (entry.isSpecial || entry.isDirectory) {
				return true;
			}

			// Check if file matches any of the filters
			if (!selectFile) {
				return false;
			}

			return fileFilters.some((regex) => regex.test(entry.name));
		});
	}, [filteredEntries, fileFilters, selectFile]);

	const { selectedIndex, navigateUp, navigateDown, reset: _reset } = useSelection(finalEntries);

	const selectedEntry = finalEntries[selectedIndex];

	// Calculate viewport dimensions
	// Estimate bottom bar height: 3 lines for normal status, 7-8 lines for input dialogs
	// In minimal mode, bottom bar is hidden for normal status
	const isNormalMode = mode === 'normal';
	const bottomBarHeight = terminalSize.isMinimal && isNormalMode ? 0 : (isNormalMode || mode === 'error' ? 3 : 8);
	const availableHeight = Math.max(5, terminalSize.height - bottomBarHeight - reservedTopHeight);
	const maxVisibleEntries = availableHeight;

	// Calculate viewport window based on scroll offset and selected index
	const viewportStart = scrollOffset;
	const viewportEnd = scrollOffset + maxVisibleEntries;

	// Restore scroll position when navigating to a new directory
	useEffect(() => {
		const savedScrollOffset = scrollPositions.current.get(currentPath) || 0;
		setScrollOffset(savedScrollOffset);
	}, [currentPath]);

	// Save scroll position when it changes
	useEffect(() => {
		scrollPositions.current.set(currentPath, scrollOffset);
	}, [currentPath, scrollOffset]);

	// Ensure selected item is always visible in viewport
	useEffect(() => {
		if (selectedIndex < scrollOffset) {
			// Selected item is above viewport, scroll up
			setScrollOffset(selectedIndex);
		} else if (selectedIndex >= scrollOffset + maxVisibleEntries) {
			// Selected item is below viewport, scroll down
			setScrollOffset(selectedIndex - maxVisibleEntries + 1);
		}
	}, [selectedIndex, scrollOffset, maxVisibleEntries]);

	// Alternate screen buffer management (like vim)
	useEffect(() => {
		if (!useAlternateScreenBuffer) {
			return;
		}

		// Enter alternate screen buffer and clear it
		// \x1b[?1049h - Save cursor position and switch to alternate screen
		// \x1b[2J - Clear screen
		// \x1b[H - Move cursor to home position
		process.stdout.write('\x1b[?1049h\x1b[2J\x1b[H');

		// Cleanup: restore original screen on unmount
		return () => {
			// \x1b[?1049l - Restore cursor position and switch back to main screen
			process.stdout.write('\x1b[?1049l');
		};
	}, [useAlternateScreenBuffer]);

	// Toggle hidden files
	const toggleHidden = useCallback(() => {
		setShowHidden((prev) => !prev);
	}, []);

	// Handle selection
	const handleSelect = useCallback(() => {
		if (!selectedEntry) return;

		// If selecting '.', return current directory
		if (selectedEntry.name === '.') {
			if (selectDirectory) {
				onSelect(currentPath);
				// Note: closeOnSelection handling would be done by parent
			}
			return;
		}

		// If selecting '..', navigate to parent
		if (selectedEntry.name === '..') {
			navigateToPath(selectedEntry.path);
			return;
		}

		// If it's a directory, navigate into it (unless we're selecting directories)
		if (selectedEntry.isDirectory) {
			if (selectDirectory && vimMode) {
				// In vim mode, need explicit select command
				// For now, just navigate
				navigateToPath(selectedEntry.path);
			} else {
				navigateToPath(selectedEntry.path);
			}
			return;
		}

		// If it's a file and we can select files
		if (selectFile) {
			onSelect(selectedEntry.path);
			// Note: closeOnSelection handling would be done by parent
		}
	}, [selectedEntry, selectDirectory, selectFile, currentPath, onSelect, navigateToPath, vimMode]);

	// Handle creating file
	const handleCreateFile = useCallback(async (name: string) => {
		const error = await createFile(currentPath, name);
		if (error) {
			setErrorMessage(error.message);
			enterErrorMode();
		} else {
			refresh();
			exitToNormal();
		}
		setOverlayInput('');
	}, [currentPath, refresh, exitToNormal, enterErrorMode]);

	// Handle creating directory
	const handleCreateDirectory = useCallback(async (name: string) => {
		const error = await createDirectory(currentPath, name);
		if (error) {
			setErrorMessage(error.message);
			enterErrorMode();
		} else {
			refresh();
			exitToNormal();
		}
		setOverlayInput('');
	}, [currentPath, refresh, exitToNormal, enterErrorMode]);

	// Handle renaming
	const handleRename = useCallback(async (newName: string) => {
		if (!itemToRename) return;

		const error = await renameFileOrDirectory(itemToRename, newName);
		if (error) {
			setErrorMessage(error.message);
			enterErrorMode();
		} else {
			refresh();
			exitToNormal();
		}
		setOverlayInput('');
		setItemToRename(null);
	}, [itemToRename, refresh, exitToNormal, enterErrorMode]);

	// Input handling based on mode
	useInput((input, key) => {
		// Error mode - any key dismisses
		if (mode === 'error') {
			setErrorMessage(null);
			exitToNormal();
			return;
		}

		// Overlay modes (search, create-file, create-dir, rename)
		if (mode === 'search' || mode === 'create-file' || mode === 'create-dir' || mode === 'rename') {
			if (key.escape) {
				setOverlayInput('');
				if (mode === 'search') {
					clearFilter();
				}
				if (mode === 'rename') {
					setItemToRename(null);
				}
				exitToNormal();
				return;
			}

			if (key.return) {
				if (mode === 'search') {
					setFilterString(overlayInput);
					setOverlayInput('');
					exitToNormal();
				} else if (mode === 'create-file') {
					handleCreateFile(overlayInput);
				} else if (mode === 'create-dir') {
					handleCreateDirectory(overlayInput);
				} else if (mode === 'rename') {
					handleRename(overlayInput);
				}
				return;
			}

			// Handle backspace/delete - check both key.backspace and key.delete
			// Different terminals may send different codes
			if (key.backspace || key.delete || input === '\u007f' || input === '\b') {
				setOverlayInput((prev) => prev.slice(0, -1));
				return;
			}

			// Add printable characters only (not control characters)
			if (input && !key.ctrl && !key.meta && input.charCodeAt(0) >= 32) {
				setOverlayInput((prev) => prev + input);
			}
			return;
		}

		// Normal mode - navigation and commands
		if (vimMode) {
			// Vim mode keybindings
			if (input === 'j') {
				navigateDown();
			} else if (input === 'k') {
				navigateUp();
			} else if (input === 'h') {
				// Go to parent
				const parentEntry = finalEntries.find((e) => e.name === '..');
				if (parentEntry) {
					navigateToPath(parentEntry.path);
				}
			} else if (input === 'l' || key.return) {
				handleSelect();
			} else if (input === 'g') {
				// This is a partial command - need to handle 'gh' for toggle hidden
				// For simplicity, we'll handle it in the next input
				// TODO: Implement proper vim command buffering
			} else if (input === '/') {
				enterSearchMode();
			} else if (input === 'R') {
				if (selectedEntry && !selectedEntry.isSpecial) {
					setItemToRename(selectedEntry.path);
					setOverlayInput(selectedEntry.name);
					enterRenameMode();
				}
			} else if (key.escape) {
				clearFilter();
			}
		} else {
			// Windows mode keybindings
			if (key.upArrow) {
				navigateUp();
			} else if (key.downArrow) {
				navigateDown();
			} else if (key.return) {
				handleSelect();
			} else if (key.backspace) {
				// Go to parent
				const parentEntry = finalEntries.find((e) => e.name === '..');
				if (parentEntry) {
					navigateToPath(parentEntry.path);
				}
			} else if (key.ctrl && input === 'h') {
				toggleHidden();
			} else if (key.ctrl && input === 'f') {
				enterSearchMode();
			} else if (key.ctrl && input === 'n') {
				enterCreateFileMode();
			} else if (key.ctrl && input === 'd') {
				enterCreateDirMode();
			} else if (input === '\x1b[1;2R') {
				// F2 key
				if (selectedEntry && !selectedEntry.isSpecial) {
					setItemToRename(selectedEntry.path);
					setOverlayInput(selectedEntry.name);
					enterRenameMode();
				}
			} else if (key.escape) {
				clearFilter();
			}
		}
	}, { isActive: true });

	return (
		<Box flexDirection="column" height={terminalSize.height}>
			{/* File List - fills available space */}
			<Box flexGrow={1} flexDirection="column" overflowY="hidden">
				<FileList
					entries={finalEntries}
					selectedIndex={selectedIndex}
					error={fsError}
					viewportStart={viewportStart}
					viewportEnd={viewportEnd}
					minimalMode={terminalSize.isMinimal}
				/>
			</Box>

			{/* Bottom Bar - unified status line and input overlay */}
			<BottomBar
				mode={mode}
				currentPath={currentPath}
				filterString={filterString}
				showHidden={showHidden}
				fileFilterActive={fileFilters.length > 0}
				visibleCount={finalEntries.length}
				totalCount={entries.length}
				errorMessage={errorMessage}
				input={overlayInput}
				vimMode={vimMode}
				minimalMode={terminalSize.isMinimal}
			/>
		</Box>
	);
}

// Runtime prop validation
InkFileExplorer.propTypes = {
	selectFile: PropTypes.bool,
	selectDirectory: PropTypes.bool,
	closeOnSelection: PropTypes.bool,
	fileFilters: PropTypes.arrayOf(PropTypes.instanceOf(RegExp)),
	vimMode: PropTypes.bool,
	onSelect: PropTypes.func.isRequired,
	initialPath: PropTypes.string,
	useAlternateScreenBuffer: PropTypes.bool,
	reservedTopHeight: PropTypes.number,
};

InkFileExplorer.defaultProps = {
	selectFile: true,
	selectDirectory: true,
	closeOnSelection: true,
	fileFilters: [],
	vimMode: false,
	initialPath: process.cwd(),
	useAlternateScreenBuffer: true,
	reservedTopHeight: 0,
};
