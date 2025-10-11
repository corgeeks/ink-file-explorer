import { test, expect, describe, afterEach } from 'bun:test';
import React from 'react';
import { render } from 'ink-testing-library';
import { InkFileExplorer } from '../components/InkFileExplorer.js';
import { createMockFileSystem, cleanupMockFileSystem } from './helpers/mockFs.js';

describe('InkFileExplorer Integration Tests', () => {
	let testDir: string;

	afterEach(async () => {
		if (testDir) {
			await cleanupMockFileSystem(testDir);
		}
	});

	test('should render the file explorer', async () => {
		testDir = await createMockFileSystem({
			files: ['file1.txt', 'file2.md'],
			directories: ['docs'],
		});

		const onSelect = () => {};
		const { lastFrame } = render(
			<InkFileExplorer
				initialPath={testDir}
				selectFile={true}
				selectDirectory={true}
				onSelect={onSelect}
			/>
		);

		// Wait a bit for the component to load
		await new Promise((resolve) => setTimeout(resolve, 100));

		const output = lastFrame();
		expect(output).toBeTruthy();
		expect(output.length).toBeGreaterThan(0);
	});

	test('should display files and directories', async () => {
		testDir = await createMockFileSystem({
			files: ['test.txt'],
			directories: ['testdir'],
		});

		const onSelect = () => {};
		const { lastFrame } = render(
			<InkFileExplorer
				initialPath={testDir}
				selectFile={true}
				selectDirectory={true}
				onSelect={onSelect}
			/>
		);

		await new Promise((resolve) => setTimeout(resolve, 100));

		const output = lastFrame();
		// Should eventually contain the test file and directory
		expect(output).toContain(testDir);
	});

	test('should show status line with path', async () => {
		testDir = await createMockFileSystem({});

		const onSelect = () => {};
		const { lastFrame } = render(
			<InkFileExplorer
				initialPath={testDir}
				selectFile={true}
				selectDirectory={true}
				onSelect={onSelect}
			/>
		);

		await new Promise((resolve) => setTimeout(resolve, 100));

		const output = lastFrame();
		expect(output).toContain(testDir);
	});

	test('should handle vim mode prop', async () => {
		testDir = await createMockFileSystem({
			files: ['file.txt'],
		});

		const onSelect = () => {};
		const { lastFrame } = render(
			<InkFileExplorer
				initialPath={testDir}
				selectFile={true}
				selectDirectory={true}
				vimMode={true}
				onSelect={onSelect}
			/>
		);

		await new Promise((resolve) => setTimeout(resolve, 100));

		const output = lastFrame();
		expect(output).toBeTruthy();
	});

	test('should handle selectFile and selectDirectory props', async () => {
		testDir = await createMockFileSystem({
			files: ['file.txt'],
			directories: ['dir'],
		});

		const onSelect = () => {};

		// Test with selectFile=false
		const { lastFrame: frame1 } = render(
			<InkFileExplorer
				initialPath={testDir}
				selectFile={false}
				selectDirectory={true}
				onSelect={onSelect}
			/>
		);

		await new Promise((resolve) => setTimeout(resolve, 100));

		const output1 = frame1();
		expect(output1).toBeTruthy();

		// Test with selectDirectory=false
		const { lastFrame: frame2 } = render(
			<InkFileExplorer
				initialPath={testDir}
				selectFile={true}
				selectDirectory={false}
				onSelect={onSelect}
			/>
		);

		await new Promise((resolve) => setTimeout(resolve, 100));

		const output2 = frame2();
		expect(output2).toBeTruthy();
	});

	test('should handle fileFilters prop', async () => {
		testDir = await createMockFileSystem({
			files: ['test.txt', 'test.md', 'image.png'],
		});

		const onSelect = () => {};
		const fileFilters = [/\.txt$/];

		const { lastFrame } = render(
			<InkFileExplorer
				initialPath={testDir}
				selectFile={true}
				selectDirectory={true}
				fileFilters={fileFilters}
				onSelect={onSelect}
			/>
		);

		await new Promise((resolve) => setTimeout(resolve, 100));

		const output = lastFrame();
		expect(output).toBeTruthy();
		// The filter should be indicated in the status line
		expect(output).toContain('[Filtered]');
	});

	test('should handle non-existent initial path', () => {
		const onSelect = () => {};
		const { lastFrame } = render(
			<InkFileExplorer
				initialPath="/non/existent/path"
				selectFile={true}
				selectDirectory={true}
				onSelect={onSelect}
			/>
		);

		const output = lastFrame();
		expect(output).toBeTruthy();
		// Should show some kind of content even with invalid path
	});
});
