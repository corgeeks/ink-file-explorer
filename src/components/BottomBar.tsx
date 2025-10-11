import { Box, Text } from 'ink';
import PropTypes from 'prop-types';
import React from 'react';

import type { InputMode } from '../types/index.js';

/**
 * Props for the unified bottom bar component.
 * This component replaces both StatusLine and InputOverlay,
 * switching between different modes like vim's command line.
 */
export interface BottomBarProps {
	// Current mode determines what to display
	mode: InputMode;

	// Props for normal mode (status display)
	currentPath?: string;
	filterString?: string;
	showHidden?: boolean;
	fileFilterActive?: boolean;
	visibleCount?: number;
	totalCount?: number;

	// Props for error mode
	errorMessage?: string | null;

	// Props for input modes (search, create-file, create-dir, rename)
	input?: string;
	vimMode?: boolean;

	// Minimal mode for small terminals (< 10 rows)
	minimalMode?: boolean;
}

/**
 * Unified bottom bar component that displays status line, input dialogs, or error messages.
 * Inspired by vim's command line, which changes based on the current mode.
 */
export function BottomBar(props: BottomBarProps) {
	const {
		mode,
		currentPath = '',
		filterString = '',
		showHidden = false,
		fileFilterActive = false,
		visibleCount = 0,
		totalCount = 0,
		errorMessage = null,
		input = '',
		vimMode = false,
		minimalMode = false,
	} = props;

	// In minimal mode, hide the status bar for normal mode
	// but still show dialogs and errors (user needs them for input)
	if (minimalMode && mode === 'normal') {
		return null;
	}

	// Error mode - highest priority
	if (mode === 'error' && errorMessage) {
		return (
			<Box borderStyle="single" borderColor="red" paddingX={1}>
				<Box flexDirection="column" width="100%">
					<Text color="red" bold>
						Error: {errorMessage}
					</Text>
					<Text dimColor>Press any key to dismiss</Text>
				</Box>
			</Box>
		);
	}

	// Input modes (search, create-file, create-dir, rename)
	if (mode === 'search' || mode === 'create-file' || mode === 'create-dir' || mode === 'rename') {
		let title = '';
		let hint = '';
		let showRegexHint = false;

		switch (mode) {
			case 'search':
				title = 'Search';
				hint = vimMode ? 'Always regex mode' : 'Start with / for regex';
				showRegexHint = input.startsWith('/');
				break;
			case 'create-file':
				title = 'Create File';
				hint = 'Enter filename';
				break;
			case 'create-dir':
				title = 'Create Directory';
				hint = 'Enter directory name';
				break;
			case 'rename':
				title = 'Rename';
				hint = 'Enter new name';
				break;
		}

		return (
			<Box
				borderStyle="round"
				borderColor="cyan"
				paddingX={1}
				flexDirection="column"
			>
				<Text bold color="cyan">
					{title}
				</Text>
				<Box marginTop={1}>
					<Text>
						{input}
						<Text backgroundColor="cyan" color="black">
							{' '}
						</Text>
					</Text>
				</Box>
				<Box marginTop={1}>
					<Text dimColor>{hint}</Text>
					{showRegexHint && (
						<Text color="green"> (regex)</Text>
					)}
				</Box>
				<Box marginTop={1}>
					<Text dimColor>ESC to cancel • Enter to confirm</Text>
				</Box>
			</Box>
		);
	}

	// Normal mode - status line display
	return (
		<Box borderStyle="single" paddingX={1}>
			<Box flexDirection="row" width="100%" justifyContent="space-between">
				{/* Left side - path */}
				<Text bold>{currentPath}</Text>

				{/* Right side - status indicators */}
				<Box>
					{showHidden && (
						<Text color="yellow">[Hidden] </Text>
					)}
					{fileFilterActive && (
						<Text color="magenta">[Filtered] </Text>
					)}
					{filterString && (
						<Text color="green">Search: {filterString} </Text>
					)}
					<Text dimColor>
						{visibleCount}/{totalCount}
					</Text>
				</Box>
			</Box>
		</Box>
	);
}

// Runtime prop validation
BottomBar.propTypes = {
	mode: PropTypes.oneOf(['normal', 'search', 'create-file', 'create-dir', 'rename', 'error']).isRequired,
	currentPath: PropTypes.string,
	filterString: PropTypes.string,
	showHidden: PropTypes.bool,
	fileFilterActive: PropTypes.bool,
	visibleCount: PropTypes.number,
	totalCount: PropTypes.number,
	errorMessage: PropTypes.string,
	input: PropTypes.string,
	vimMode: PropTypes.bool,
	minimalMode: PropTypes.bool,
};

BottomBar.defaultProps = {
	currentPath: '',
	filterString: '',
	showHidden: false,
	fileFilterActive: false,
	visibleCount: 0,
	totalCount: 0,
	errorMessage: null,
	input: '',
	vimMode: false,
	minimalMode: false,
};
