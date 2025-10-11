import { useState, useMemo, useCallback } from 'react';
import type { FileEntry } from '../../types/index.js';

/**
 * Result object returned by the useFilter hook.
 */
export interface UseFilterResult {
	/** Current filter string */
	filterString: string;
	/** Filtered array of entries matching the filter */
	filteredEntries: FileEntry[];
	/** Set a new filter string (supports regex when starting with /) */
	setFilterString: (filter: string) => void;
	/** Clear the current filter */
	clearFilter: () => void;
	/** Whether a filter is currently active */
	isActive: boolean;
}

/**
 * Hook for filtering file entries with regex support.
 *
 * Supports two modes:
 * - Plain text search (case-insensitive substring matching)
 * - Regex search (when filter starts with /)
 *
 * Special entries (. and ..) are always included in filtered results.
 * Invalid regex patterns gracefully fall back to plain text search.
 *
 * @example
 * ```tsx
 * const { filteredEntries, setFilterString, clearFilter } = useFilter(entries);
 *
 * // Plain text search
 * setFilterString('document');
 *
 * // Regex search
 * setFilterString('/\\.tsx?$/');
 *
 * // Clear filter
 * clearFilter();
 * ```
 *
 * @param entries - Array of file entries to filter
 * @returns Filter state and control functions
 */
export function useFilter(entries: FileEntry[]): UseFilterResult {
	const [filterString, setFilterString] = useState('');

	const filteredEntries = useMemo(() => {
		if (!filterString) {
			return entries;
		}

		// Check if it's regex mode (starts with /)
		const isRegex = filterString.startsWith('/');
		const pattern = isRegex ? filterString.slice(1) : filterString;

		try {
			// Create case-insensitive regex
			const regex = new RegExp(pattern, 'i');

			return entries.filter((entry) => {
				// Always keep . and ..
				if (entry.isSpecial) {
					return true;
				}

				return regex.test(entry.name);
			});
		} catch {
			// If regex is invalid, fall back to plain text matching
			const lowerPattern = pattern.toLowerCase();
			return entries.filter((entry) => {
				if (entry.isSpecial) {
					return true;
				}

				return entry.name.toLowerCase().includes(lowerPattern);
			});
		}
	}, [entries, filterString]);

	const clearFilter = useCallback(() => {
		setFilterString('');
	}, []);

	return {
		filterString,
		filteredEntries,
		setFilterString,
		clearFilter,
		isActive: filterString.length > 0,
	};
}
