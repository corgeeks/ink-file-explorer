#!/usr/bin/env bun
/**
 * Demo Application for InkFileExplorer
 *
 * This demo showcases the InkFileExplorer component with various configurations.
 *
 * Usage:
 *   bun run src/main.ts [--vim] [--select-dir-only] [--select-file-only] [--start-path <path>]
 *
 * Options:
 *   --vim               Enable vim-mode keybindings (default: Windows mode)
 *   --select-dir-only   Only allow directory selection
 *   --select-file-only  Only allow file selection
 *   --start-path <path> Starting directory (default: current directory)
 *   --filter <pattern>  Add a regex filter (e.g., --filter "\.ts$")
 *
 * Keybindings:
 *
 * Windows Mode (default):
 *   - Arrow Up/Down: Navigate
 *   - Enter: Select/Open directory
 *   - Backspace: Go to parent directory
 *   - Ctrl+h: Toggle hidden files
 *   - Ctrl+f: Search/filter
 *   - Ctrl+n: Create new file
 *   - Ctrl+d: Create new directory
 *   - F2: Rename file/directory
 *   - Esc: Clear search filter
 *
 * Vim Mode:
 *   - j/k: Navigate down/up
 *   - l/Enter: Select/Open directory
 *   - h: Go to parent directory
 *   - /: Search/filter (regex)
 *   - R: Rename file/directory
 *   - Esc: Clear search filter
 */

import React from 'react';
import { render, Box, Text } from 'ink';
import { InkFileExplorer } from './components/InkFileExplorer.js';

// Parse command line arguments
const args = process.argv.slice(2);
const vimMode = args.includes('--vim');
const selectDirOnly = args.includes('--select-dir-only');
const selectFileOnly = args.includes('--select-file-only');

let startPath = process.cwd();
const startPathIndex = args.indexOf('--start-path');
const startPathArg = args[startPathIndex + 1];
if (startPathIndex !== -1 && startPathArg) {
	startPath = startPathArg;
}

const fileFilters: RegExp[] = [];
const filterIndex = args.indexOf('--filter');
const filterArg = args[filterIndex + 1];
if (filterIndex !== -1 && filterArg) {
	try {
		fileFilters.push(new RegExp(filterArg));
	} catch (e) {
		console.error('Invalid regex pattern:', filterArg);
		process.exit(1);
	}
}

// Demo component
function Demo() {
	return (
		<Box flexDirection="column">
			<Box borderStyle="round" borderColor="cyan" paddingX={2} paddingY={0}>
				<Text bold color="cyan">
					InkFileExplorer Demo {vimMode ? '(Vim Mode)' : '(Windows Mode)'}
				</Text>
			</Box>

			<InkFileExplorer
					selectFile={!selectDirOnly}
					selectDirectory={!selectFileOnly}
					closeOnSelection={true}
					fileFilters={fileFilters}
					vimMode={vimMode}
					initialPath={startPath}
					reservedTopHeight={3}
					useAlternateScreenBuffer={false}
					onSelect={(path) => {
						// Restore main screen buffer before showing result
						process.stdout.write('\x1b[?1049l');
						// Show selection result on main screen
						console.log('\n✓ Selection made!');
						console.log(`Selected path: ${path}\n`);
						process.exit(0);
					}}
				/>
		</Box>
	);
}

// Enter alternate screen buffer before rendering
// This ensures the terminal is saved before Ink writes anything
process.stdout.write('\x1b[?1049h\x1b[2J\x1b[H');

// Render the demo
const { unmount } = render(<Demo />);

// Handle process termination
process.on('SIGINT', () => {
	unmount();
	// Restore main screen buffer
	process.stdout.write('\x1b[?1049l');
	console.log('\n\nDemo terminated by user.');
	process.exit(0);
});

process.on('SIGTERM', () => {
	unmount();
	// Restore main screen buffer
	process.stdout.write('\x1b[?1049l');
	process.exit(0);
});

// Also handle normal exit
process.on('exit', () => {
	// Restore main screen buffer if not already done
	process.stdout.write('\x1b[?1049l');
});
