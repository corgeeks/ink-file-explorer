#!/usr/bin/env node
import type { FileEntry } from '@corgeeks/ink-file-explorer';
import {
	useFileSystem,
	useFilter,
	useInputMode,
	useSelection,
} from '@corgeeks/ink-file-explorer';
import { Box, render, Text, useInput } from 'ink';
import React from 'react';

/**
 * Custom File Explorer Example
 *
 * This example demonstrates building a custom file explorer UI using
 * the exported hooks. You have full control over the rendering and behavior.
 */

function CustomFileExplorer() {
	const [showHidden, setShowHidden] = React.useState(false);

	// Use the file system hook
	const { currentPath, entries, navigateToPath, error } = useFileSystem(
		process.cwd(),
		showHidden
	);

	// Use the filter hook
	const { filteredEntries, filterString, setFilterString } = useFilter(entries);

	// Use the selection hook
	const { selectedIndex, navigateUp, navigateDown } = useSelection(filteredEntries);

	// Use the input mode hook
	const { mode, enterSearchMode, exitToNormal } = useInputMode();

	// Get the currently selected entry with explicit typing
	const selectedEntry: FileEntry | undefined = filteredEntries[selectedIndex];

	// Handle input
	useInput((input, key) => {
		if (mode === 'search') {
			if (key.escape) {
				exitToNormal();
				setFilterString('');
			} else if (key.return) {
				exitToNormal();
			} else if (input) {
				setFilterString(filterString + input);
			}
			return;
		}

		// Normal mode
		if (key.upArrow) {
			navigateUp();
		} else if (key.downArrow) {
			navigateDown();
		} else if (key.return) {
			const selected = filteredEntries[selectedIndex];
			if (selected?.isDirectory && selected.name !== '.') {
				navigateToPath(selected.path);
			} else if (selected?.name === '.' || !selected?.isDirectory) {
				console.log('\nSelected:', selected?.path);
				process.exit(0);
			}
		} else if (input === 'h') {
			setShowHidden(!showHidden);
		} else if (input === '/') {
			enterSearchMode();
		}
	});

	return (
		<Box flexDirection="column">
			{/* Header */}
			<Box borderStyle="single" borderColor="cyan">
				<Text bold color="cyan">
					Custom File Explorer - {currentPath}
				</Text>
			</Box>

			{/* File list */}
			<Box flexDirection="column" marginY={1}>
				{error ? (
					<Text color="red">Error: {error.message}</Text>
				) : filteredEntries.length === 0 ? (
					<Text dimColor>Empty directory</Text>
				) : (
					filteredEntries.map((entry, index) => (
						<Box key={entry.path}>
							<Text
								color={index === selectedIndex ? 'cyan' : entry.isDirectory ? 'blue' : 'white'}
								bold={index === selectedIndex}
							>
								{index === selectedIndex ? '> ' : '  '}
								{entry.name}
								{entry.isDirectory && !entry.isSpecial ? '/' : ''}
							</Text>
						</Box>
					))
				)}
			</Box>

			{/* Status bar */}
			<Box borderStyle="single">
				<Text>
					{mode === 'search' ? (
						<>
							Search: {filterString}
							<Text dimColor> (ESC to cancel, Enter to confirm)</Text>
						</>
					) : (
						<>
							Press / to search, h to toggle hidden, ↑↓ to navigate, Enter to select
							{showHidden && <Text color="yellow"> [Hidden]</Text>}
							{filterString && <Text color="green"> [Filter: {filterString}]</Text>}
						</>
					)}
				</Text>
			</Box>

			{/* Selection info */}
			<Box marginTop={1}>
				<Text dimColor>
					Selected: {selectedEntry?.name || 'none'} ({selectedIndex + 1}/{filteredEntries.length})
				</Text>
			</Box>
		</Box>
	);
}

render(<CustomFileExplorer />);
