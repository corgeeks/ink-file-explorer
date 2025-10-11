import React from 'react';
import { Box, Text } from 'ink';
import PropTypes from 'prop-types';
import type { FileEntry, FileSystemError } from '../types/index.js';

export interface FileListProps {
	entries: FileEntry[];
	selectedIndex: number;
	error?: FileSystemError | null;
	// Viewport props for scrolling
	viewportStart?: number;
	viewportEnd?: number;
	// Minimal mode for small terminals (< 10 rows)
	minimalMode?: boolean;
}

/**
 * Displays a scrollable list of files and directories with viewport management.
 *
 * Features:
 * - Viewport-based rendering for large directories
 * - Visual indicators for scroll position (more above/below)
 * - Minimal mode for small terminals
 * - Color-coded entries (directories, hidden files, selected item)
 * - Error handling and display
 *
 * @example
 * ```tsx
 * <FileList
 *   entries={fileEntries}
 *   selectedIndex={0}
 *   viewportStart={0}
 *   viewportEnd={20}
 * />
 * ```
 *
 * @param props - Component properties
 * @returns A rendered file list component
 */
export function FileList({ entries, selectedIndex, error, viewportStart = 0, viewportEnd, minimalMode = false }: FileListProps) {
	// Calculate viewport slicing for all cases
	const actualViewportEnd = viewportEnd !== undefined ? viewportEnd : entries.length;
	const visibleEntries = entries.slice(viewportStart, actualViewportEnd);

	// If there's a permission error, show it
	if (error?.type === 'permission') {
		return (
			<Box flexDirection="column" paddingY={1}>
				{/* Still show .. if available */}
				{visibleEntries.map((entry, viewportIndex) => {
					const actualIndex = viewportStart + viewportIndex;
					return (
						<Box key={entry.isSpecial ? `${entry.path}#${entry.name}` : entry.path}>
							<Text color={actualIndex === selectedIndex ? 'cyan' : 'white'}>
								{actualIndex === selectedIndex ? '> ' : '  '}
								{entry.name}
								{entry.isDirectory ? '/' : ''}
							</Text>
						</Box>
					);
				})}

				{/* Show error message */}
				<Box marginTop={2} justifyContent="center">
					<Text color="red" bold>
						⚠ {error.message}
					</Text>
				</Box>
			</Box>
		);
	}

	// Empty directory
	if (entries.length === 0) {
		if (minimalMode) {
			return <Text>Empty</Text>;
		}
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text dimColor>Empty directory</Text>
			</Box>
		);
	}

	// Normal file list
	// Check if there's more content above/below the viewport
	const hasMoreAbove = viewportStart > 0;
	const hasMoreBelow = actualViewportEnd < entries.length;

	// Minimal mode: simple, compact rendering
	if (minimalMode) {
		return (
			<Box flexDirection="column">
				{visibleEntries.map((entry, viewportIndex) => {
					const actualIndex = viewportStart + viewportIndex;
					const isSelected = actualIndex === selectedIndex;
					return (
						<Text key={entry.isSpecial ? `${entry.path}#${entry.name}` : entry.path} bold={isSelected}>
							{isSelected ? '>' : ' '} {entry.name}
						</Text>
					);
				})}
			</Box>
		);
	}

	// Normal mode: full styling with colors and indicators
	return (
		<Box flexDirection="column">
			{/* Indicator for more content above */}
			{hasMoreAbove && (
				<Box>
					<Text dimColor>↑ {viewportStart} more above</Text>
				</Box>
			)}

			{/* Visible entries */}
			{visibleEntries.map((entry, viewportIndex) => {
				const actualIndex = viewportStart + viewportIndex;
				const isSelected = actualIndex === selectedIndex;

				// Determine color based on entry type
				let color: string = 'white';
				let dimColor = false;

				if (entry.isDirectory) {
					color = 'blue';
				} else if (entry.isHidden) {
					dimColor = true;
				}

				// Selected item gets cyan color
				if (isSelected) {
					color = 'cyan';
					dimColor = false;
				}

				return (
					<Box key={entry.isSpecial ? `${entry.path}#${entry.name}` : entry.path}>
						<Text color={color} dimColor={dimColor} bold={isSelected}>
							{isSelected ? '> ' : '  '}
							{entry.name}
							{entry.isDirectory && !entry.isSpecial ? '/' : ''}
						</Text>
					</Box>
				);
			})}

			{/* Indicator for more content below */}
			{hasMoreBelow && (
				<Box>
					<Text dimColor>↓ {entries.length - actualViewportEnd} more below</Text>
				</Box>
			)}
		</Box>
	);
}

// Runtime prop validation
FileList.propTypes = {
	entries: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			path: PropTypes.string.isRequired,
			isDirectory: PropTypes.bool.isRequired,
			isHidden: PropTypes.bool.isRequired,
			isSpecial: PropTypes.bool.isRequired,
		}).isRequired
	).isRequired,
	selectedIndex: PropTypes.number.isRequired,
	error: PropTypes.shape({
		type: PropTypes.oneOf(['permission', 'not_found', 'invalid_name', 'already_exists', 'unknown']).isRequired,
		message: PropTypes.string.isRequired,
		path: PropTypes.string,
	}),
	viewportStart: PropTypes.number,
	viewportEnd: PropTypes.number,
	minimalMode: PropTypes.bool,
};

FileList.defaultProps = {
	error: null,
	viewportStart: 0,
	viewportEnd: undefined,
	minimalMode: false,
};
