import { useState, useEffect, useCallback } from 'react';
import type { FileEntry } from '../../types/index.js';

/**
 * Result object returned by the useSelection hook.
 */
export interface UseSelectionResult {
	/** Currently selected index in the entries array */
	selectedIndex: number;
	/** Move selection up one item (decrement index) */
	navigateUp: () => void;
	/** Move selection down one item (increment index) */
	navigateDown: () => void;
	/** Set selection to a specific index (clamped to valid range) */
	setIndex: (index: number) => void;
	/** Reset selection to the first item (index 0) */
	reset: () => void;
}

/**
 * Hook for managing selection state in a list of entries.
 *
 * Provides navigation functions with automatic bounds checking.
 * Automatically resets selection to 0 when the entries array changes.
 *
 * @example
 * ```tsx
 * const { selectedIndex, navigateUp, navigateDown } = useSelection(fileEntries);
 *
 * // Move selection up/down
 * navigateUp();
 * navigateDown();
 *
 * // Access selected entry
 * const selectedEntry = fileEntries[selectedIndex];
 * ```
 *
 * @param entries - Array of file entries to select from
 * @returns Selection state and navigation functions
 */
export function useSelection(entries: FileEntry[]): UseSelectionResult {
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Reset selection when entries change
	useEffect(() => {
		setSelectedIndex(0);
	}, [entries]);

	const navigateUp = useCallback(() => {
		setSelectedIndex((prev) => {
			if (prev <= 0) return 0;
			return prev - 1;
		});
	}, []);

	const navigateDown = useCallback(() => {
		setSelectedIndex((prev) => {
			const maxIndex = entries.length - 1;
			if (prev >= maxIndex) return maxIndex;
			return prev + 1;
		});
	}, [entries.length]);

	const setIndex = useCallback((index: number) => {
		const maxIndex = entries.length - 1;
		const clampedIndex = Math.max(0, Math.min(index, maxIndex));
		setSelectedIndex(clampedIndex);
	}, [entries.length]);

	const reset = useCallback(() => {
		setSelectedIndex(0);
	}, []);

	return {
		selectedIndex,
		navigateUp,
		navigateDown,
		setIndex,
		reset,
	};
}
