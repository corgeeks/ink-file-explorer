#!/usr/bin/env node
import { InkFileExplorer } from '@corgeeks/ink-file-explorer';
import { render } from 'ink';

/**
 * Basic File Selector Example
 *
 * This example demonstrates the simplest use case: a file selector
 * that logs the selected path and exits.
 */

function App() {
	return (
		<InkFileExplorer
			onSelect={(path) => {
				// This callback is called when the user selects a file or directory
				console.log('\nYou selected:', path);
				process.exit(0);
			}}
		/>
	);
}

// Render the application
render(<App />, {readlineBackend: true});
