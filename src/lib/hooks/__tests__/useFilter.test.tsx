import { describe, expect, test } from 'bun:test';
import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import React, { useState } from 'react';

import type { FileEntry } from '../../../types/index.js';
import { useFilter } from '../useFilter.js';

// Helper to wait for a frame update
const waitForFrame = (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

describe('useFilter', () => {
	const createMockEntries = (): FileEntry[] => {
		return [
			{ name: '.', path: '/test', isDirectory: true, isHidden: false, isSpecial: true },
			{ name: '..', path: '/', isDirectory: true, isHidden: false, isSpecial: true },
			{ name: 'README.md', path: '/test/README.md', isDirectory: false, isHidden: false, isSpecial: false },
			{ name: 'package.json', path: '/test/package.json', isDirectory: false, isHidden: false, isSpecial: false },
			{ name: 'index.ts', path: '/test/index.ts', isDirectory: false, isHidden: false, isSpecial: false },
			{ name: 'index.tsx', path: '/test/index.tsx', isDirectory: false, isHidden: false, isSpecial: false },
			{ name: 'test.js', path: '/test/test.js', isDirectory: false, isHidden: false, isSpecial: false },
			{ name: 'docs', path: '/test/docs', isDirectory: true, isHidden: false, isSpecial: false },
			{ name: '.hidden', path: '/test/.hidden', isDirectory: false, isHidden: true, isSpecial: false },
		];
	};

	// Test component that uses the hook
	function FilterTestComponent({ entries, initialFilter = '' }: { entries: FileEntry[]; initialFilter?: string }) {
		const [triggerFilter, setTriggerFilter] = useState(initialFilter);
		const { filterString, filteredEntries, setFilterString, clearFilter, isActive } = useFilter(entries);

		// Apply initial filter if provided
		React.useEffect(() => {
			if (triggerFilter && triggerFilter !== filterString) {
				setFilterString(triggerFilter);
			}
		}, [triggerFilter, filterString, setFilterString]);

		return (
			<Box flexDirection="column">
				<Text>Filter: {filterString}</Text>
				<Text>Active: {isActive ? 'yes' : 'no'}</Text>
				<Text>Count: {filteredEntries.length}</Text>
				<Text>Entries: {filteredEntries.map((e) => e.name).join(',')}</Text>
				{/* Hidden actions for testing */}
				<Text data-testid="setFilter" onClick={() => setTriggerFilter('test')} />
				<Text data-testid="clearFilter" onClick={() => clearFilter()} />
			</Box>
		);
	}

	test('returns all entries when no filter is applied', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} />);

		expect(lastFrame()).toContain('Filter:');
		expect(lastFrame()).toContain('Active: no');
		expect(lastFrame()).toContain('Count: 9');
	});

	test('filters entries with plain text search', async () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="index" />);

		await waitForFrame();
		expect(lastFrame()).toContain('Active: yes');
		expect(lastFrame()).toContain('Count: 4'); // ., .., index.ts, index.tsx
		expect(lastFrame()).toContain('index.ts');
		expect(lastFrame()).toContain('index.tsx');
	});

	test('plain text search is case-insensitive', async () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="readme" />);

		await waitForFrame();
		expect(lastFrame()).toContain('Count: 3'); // ., .., README.md
		expect(lastFrame()).toContain('README.md');
	});

	test('filters with regex pattern starting with /', async () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="/.tsx?$" />);

		await waitForFrame();
		expect(lastFrame()).toContain('Count: 4'); // ., .., index.ts, index.tsx
	});

	test('regex search is case-insensitive', async () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="/readme" />);

		await waitForFrame();
		expect(lastFrame()).toContain('README.md');
	});

	test('always includes special entries in results', async () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="nonexistent" />);

		await waitForFrame();
		expect(lastFrame()).toContain('Count: 2'); // Only . and ..
		expect(lastFrame()).toContain('Entries: .,..');
	});

	test('handles invalid regex by falling back to plain text', async () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="/[invalid(regex" />);

		await waitForFrame();
		// Should not crash, should fall back to plain text search
		expect(lastFrame()).toContain('Count: 2'); // Only . and .. (no matches)
	});

	test('filters with special characters in plain text mode', async () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter=".json" />);

		await waitForFrame();
		expect(lastFrame()).toContain('package.json');
	});

	test('filters JavaScript files with regex', async () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="/.js$" />);

		await waitForFrame();
		expect(lastFrame()).toContain('test.js');
		expect(lastFrame()).not.toContain('index.ts');
	});

	test('matches files starting with dot using regex', async () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="/^[.]" />);

		await waitForFrame();
		expect(lastFrame()).toContain('.hidden');
	});

	test('handles empty filter string', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="" />);

		expect(lastFrame()).toContain('Active: no');
		expect(lastFrame()).toContain('Count: 9');
	});

	test('matches multiple extensions with regex', async () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="/[.](md|json)$" />);

		await waitForFrame();
		expect(lastFrame()).toContain('README.md');
		expect(lastFrame()).toContain('package.json');
	});

	test('handles empty entries array', async () => {
		const { lastFrame } = render(<FilterTestComponent entries={[]} initialFilter="test" />);

		await waitForFrame();
		expect(lastFrame()).toContain('Count: 0');
	});

	test('isActive reflects filter state correctly', async () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} />);

		// No filter initially
		expect(lastFrame()).toContain('Active: no');

		// With filter
		const { lastFrame: lastFrame2 } = render(<FilterTestComponent entries={entries} initialFilter="test" />);
		await waitForFrame();
		expect(lastFrame2()).toContain('Active: yes');
	});
});
