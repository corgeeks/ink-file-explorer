#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { InkFileExplorer } from '@corgeeks/ink-file-explorer';

/**
 * Filtered File Selector Example
 *
 * This example demonstrates using file filters to only show specific
 * file types. Useful when you need users to select a particular kind of file.
 */

function App() {
	// Define file filters as regular expressions
	const fileFilters = [
		/\.tsx?$/,    // TypeScript files (.ts, .tsx)
		/\.jsx?$/,    // JavaScript files (.js, .jsx)
	];

	return (
		<InkFileExplorer
			// Apply file filters
			fileFilters={fileFilters}
			// Only allow file selection (not directories)
			selectDirectory={false}
			onSelect={(filePath) => {
				console.log('\nYou selected:', filePath);
				console.log('File type: TypeScript or JavaScript');
				process.exit(0);
			}}
		/>
	);
}

render(<App />);
