import { useCallback,useState } from 'react';

import type { InputMode } from '../../types/index.js';

/**
 * Result object returned by the useInputMode hook.
 */
export interface UseInputModeResult {
	/** Current input mode */
	mode: InputMode;
	/** Set a specific input mode */
	setMode: (mode: InputMode) => void;
	/** Enter search mode */
	enterSearchMode: () => void;
	/** Enter create file mode */
	enterCreateFileMode: () => void;
	/** Enter create directory mode */
	enterCreateDirMode: () => void;
	/** Enter rename mode */
	enterRenameMode: () => void;
	/** Enter error display mode */
	enterErrorMode: () => void;
	/** Exit to normal mode */
	exitToNormal: () => void;
}

/**
 * Hook for managing input mode state.
 *
 * Tracks the current mode of the file explorer (normal, search, create-file, etc.)
 * and provides convenient functions for mode transitions. Similar to vim's mode
 * system (normal, insert, command).
 *
 * @example
 * ```tsx
 * const { mode, enterSearchMode, exitToNormal } = useInputMode();
 *
 * // Enter search mode
 * enterSearchMode(); // mode becomes 'search'
 *
 * // Return to normal mode
 * exitToNormal(); // mode becomes 'normal'
 * ```
 *
 * @param initialMode - Starting mode (default: 'normal')
 * @returns Mode state and transition functions
 */
export function useInputMode(initialMode: InputMode = 'normal'): UseInputModeResult {
	const [mode, setMode] = useState<InputMode>(initialMode);

	const enterSearchMode = useCallback(() => setMode('search'), []);
	const enterCreateFileMode = useCallback(() => setMode('create-file'), []);
	const enterCreateDirMode = useCallback(() => setMode('create-dir'), []);
	const enterRenameMode = useCallback(() => setMode('rename'), []);
	const enterErrorMode = useCallback(() => setMode('error'), []);
	const exitToNormal = useCallback(() => setMode('normal'), []);

	return {
		mode,
		setMode,
		enterSearchMode,
		enterCreateFileMode,
		enterCreateDirMode,
		enterRenameMode,
		enterErrorMode,
		exitToNormal,
	};
}
