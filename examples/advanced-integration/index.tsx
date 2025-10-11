#!/usr/bin/env node
import React, { useState } from 'react';
import { render, Box, Text } from 'ink';
import { InkFileExplorer } from '@corgeeks/ink-file-explorer';

/**
 * Advanced Integration Example
 *
 * This example demonstrates embedding the file explorer within a larger
 * Ink application, with proper state management and integration with
 * other components.
 */

type AppState = 'menu' | 'selecting' | 'result';

function App() {
	const [state, setState] = useState<AppState>('menu');
	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const [selectionMode, setSelectionMode] = useState<'file' | 'directory'>('file');

	// Handle file selection
	const handleSelect = (path: string) => {
		setSelectedFile(path);
		setState('result');
	};

	// Render menu
	if (state === 'menu') {
		return (
			<Box flexDirection="column" padding={1}>
				<Box marginBottom={1}>
					<Text bold color="cyan">
						File Manager Application
					</Text>
				</Box>

				<Box flexDirection="column" borderStyle="single" padding={1}>
					<Text>Welcome! What would you like to do?</Text>
					<Text> </Text>
					<Text color="green">Press 'f' to select a file</Text>
					<Text color="blue">Press 'd' to select a directory</Text>
					<Text color="red">Press 'q' to quit</Text>
				</Box>

				<Box marginTop={1}>
					<Text dimColor>Waiting for input...</Text>
				</Box>

				{/* Hidden input handler */}
				<HiddenInput
					onPress={(key) => {
						if (key === 'f') {
							setSelectionMode('file');
							setState('selecting');
						} else if (key === 'd') {
							setSelectionMode('directory');
							setState('selecting');
						} else if (key === 'q') {
							process.exit(0);
						}
					}}
				/>
			</Box>
		);
	}

	// Render file selector
	if (state === 'selecting') {
		return (
			<Box flexDirection="column">
				<Box borderStyle="single" borderColor="cyan" padding={1} marginBottom={1}>
					<Text color="cyan">
						{selectionMode === 'file'
							? 'Select a file (ESC to go back)'
							: 'Select a directory (ESC to go back)'}
					</Text>
				</Box>

				<InkFileExplorer
					useAlternateScreenBuffer={false}
					selectFile={selectionMode === 'file'}
					selectDirectory={selectionMode === 'directory'}
					onSelect={handleSelect}
					reservedTopHeight={3}
				/>

				<HiddenInput
					onPress={(key) => {
						if (key === 'escape') {
							setState('menu');
						}
					}}
				/>
			</Box>
		);
	}

	// Render result
	return (
		<Box flexDirection="column" padding={1}>
			<Box marginBottom={1}>
				<Text bold color="green">
					✓ Selection Complete
				</Text>
			</Box>

			<Box flexDirection="column" borderStyle="single" padding={1}>
				<Text>
					You selected {selectionMode}: <Text bold>{selectedFile}</Text>
				</Text>
				<Text> </Text>
				<Text dimColor>In a real application, you would now:</Text>
				<Text dimColor>• Process the selected {selectionMode}</Text>
				<Text dimColor>• Perform operations on it</Text>
				<Text dimColor>• Update application state</Text>
			</Box>

			<Box marginTop={1}>
				<Text color="cyan">Press 'm' to return to menu, 'q' to quit</Text>
			</Box>

			<HiddenInput
				onPress={(key) => {
					if (key === 'm') {
						setState('menu');
						setSelectedFile(null);
					} else if (key === 'q') {
						process.exit(0);
					}
				}}
			/>
		</Box>
	);
}

// Helper component for input handling when not using InkFileExplorer
function HiddenInput({ onPress }: { onPress: (key: string) => void }) {
	const [lastKey, setLastKey] = React.useState('');

	React.useEffect(() => {
		const handler = (ch: string, key: any) => {
			const keyName = key.name || ch;
			setLastKey(keyName);
			onPress(keyName);
		};

		process.stdin.on('keypress', handler);
		return () => {
			process.stdin.off('keypress', handler);
		};
	}, [onPress]);

	return null;
}

render(<App />);
