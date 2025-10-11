import { useCallback,useEffect, useState } from 'react';

import type { FileEntry, FileSystemError } from '../../types/index.js';
import { readDirectory } from '../fileSystem.js';

/**
 * Result object returned by the useFileSystem hook.
 */
export interface UseFileSystemResult {
	/** Current directory path */
	currentPath: string;
	/** Array of file and directory entries in the current path */
	entries: FileEntry[];
	/** Loading state while directory is being read */
	isLoading: boolean;
	/** Error object if directory read failed, null otherwise */
	error: FileSystemError | null;
	/** Navigate to a different directory path */
	navigateToPath: (path: string) => void;
	/** Refresh the current directory listing */
	refresh: () => void;
}

/**
 * Hook for managing file system navigation and directory reading.
 *
 * Provides directory listing with automatic reloading when the path or
 * visibility settings change. Handles errors gracefully and provides
 * navigation and refresh capabilities.
 *
 * @example
 * ```tsx
 * const { entries, currentPath, navigateToPath, error } = useFileSystem(
 *   process.cwd(),
 *   false // don't show hidden files
 * );
 *
 * // Navigate to a subdirectory
 * navigateToPath('/home/user/documents');
 * ```
 *
 * @param initialPath - Starting directory path
 * @param showHidden - Whether to include hidden files (starting with .)
 * @returns File system state and navigation functions
 */
export function useFileSystem(
	initialPath: string,
	showHidden: boolean
): UseFileSystemResult {
	const [currentPath, setCurrentPath] = useState(initialPath);
	const [entries, setEntries] = useState<FileEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<FileSystemError | null>(null);

	const loadDirectory = useCallback(async (path: string) => {
		setIsLoading(true);
		setError(null);

		const result = await readDirectory(path, showHidden);

		setEntries(result.entries);
		setError(result.error || null);
		setIsLoading(false);
	}, [showHidden]);

	// Load directory when path or showHidden changes
	useEffect(() => {
		loadDirectory(currentPath);
	}, [currentPath, loadDirectory]);

	const navigateToPath = useCallback((path: string) => {
		setCurrentPath(path);
	}, []);

	const refresh = useCallback(() => {
		loadDirectory(currentPath);
	}, [currentPath, loadDirectory]);

	return {
		currentPath,
		entries,
		isLoading,
		error,
		navigateToPath,
		refresh,
	};
}
