#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { InkFileExplorer } from '@corgeeks/ink-file-explorer';

/**
 * Directory-Only Selector Example
 *
 * This example demonstrates selecting directories only, useful for
 * scenarios like "Choose installation directory" or "Select project folder".
 */

function App() {
	return (
		<InkFileExplorer
			// Disable file selection
			selectFile={false}
			// Enable directory selection
			selectDirectory={true}
			onSelect={(directoryPath) => {
				console.log('\nYou selected directory:', directoryPath);
				console.log('This could be used as an installation path, project location, etc.');
				process.exit(0);
			}}
		/>
	);
}

render(<App />);
