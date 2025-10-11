import { describe,expect, test } from 'bun:test';
import { render } from 'ink-testing-library';
import React from 'react';

import type { FileEntry } from '../../types/index.js';
import { FileList } from '../FileList.js';

describe('FileList', () => {
	const createMockEntries = (): FileEntry[] => {
		return [
			{ name: '.', path: '/test', isDirectory: true, isHidden: false, isSpecial: true },
			{ name: '..', path: '/', isDirectory: true, isHidden: false, isSpecial: true },
			{ name: 'docs', path: '/test/docs', isDirectory: true, isHidden: false, isSpecial: false },
			{ name: 'file.txt', path: '/test/file.txt', isDirectory: false, isHidden: false, isSpecial: false },
			{ name: '.hidden', path: '/test/.hidden', isDirectory: false, isHidden: true, isSpecial: false },
		];
	};

	test('should render file list', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(
			<FileList entries={entries} selectedIndex={0} />
		);

		const output = lastFrame();
		expect(output).toContain('.');
		expect(output).toContain('..');
		expect(output).toContain('docs');
		expect(output).toContain('file.txt');
	});

	test('should indicate selected item', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(
			<FileList entries={entries} selectedIndex={2} />
		);

		const output = lastFrame();
		// The selected item (index 2 = 'docs') should have a selection indicator
		expect(output).toContain('>');
	});

	test('should show directory indicator /', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(
			<FileList entries={entries} selectedIndex={0} />
		);

		const output = lastFrame();
		// Directories (except . and ..) should have / suffix
		expect(output).toContain('docs/');
	});

	test('should handle empty directory', () => {
		const { lastFrame } = render(
			<FileList entries={[]} selectedIndex={0} />
		);

		const output = lastFrame();
		expect(output).toContain('Empty directory');
	});

	test('should display permission error', () => {
		const entries = [
			{ name: '..', path: '/', isDirectory: true, isHidden: false, isSpecial: true },
		];
		const error = {
			type: 'permission' as const,
			message: 'Permission denied',
			path: '/restricted',
		};

		const { lastFrame } = render(
			<FileList entries={entries} selectedIndex={0} error={error} />
		);

		const output = lastFrame();
		expect(output).toContain('Permission denied');
		expect(output).toContain('..');
	});

	test('should render all entries', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(
			<FileList entries={entries} selectedIndex={0} />
		);

		const output = lastFrame();
		entries.forEach((entry) => {
			expect(output).toContain(entry.name);
		});
	});
});
