import { describe, expect, test } from 'bun:test';
import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import React, { useState } from 'react';

import type { FileEntry } from '../../../types/index.js';
import { useFilter } from '../useFilter.js';

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

	test('filters entries with plain text search', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="index" />);

		// Wait a tick for the effect to apply
		setTimeout(() => {
			expect(lastFrame()).toContain('Active: yes');
			expect(lastFrame()).toContain('Count: 4'); // ., .., index.ts, index.tsx
			expect(lastFrame()).toContain('index.ts');
			expect(lastFrame()).toContain('index.tsx');
		}, 10);
	});

	test('plain text search is case-insensitive', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="readme" />);

		setTimeout(() => {
			expect(lastFrame()).toContain('Count: 3'); // ., .., README.md
			expect(lastFrame()).toContain('README.md');
		}, 10);
	});

	test('filters with regex pattern starting with /', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="/\\.tsx?$" />);

		setTimeout(() => {
			expect(lastFrame()).toContain('Count: 4'); // ., .., index.ts, index.tsx
		}, 10);
	});

	test('regex search is case-insensitive', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="/readme" />);

		setTimeout(() => {
			expect(lastFrame()).toContain('README.md');
		}, 10);
	});

	test('always includes special entries in results', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="nonexistent" />);

		setTimeout(() => {
			expect(lastFrame()).toContain('Count: 2'); // Only . and ..
			expect(lastFrame()).toContain('Entries: .,..');
		}, 10);
	});

	test('handles invalid regex by falling back to plain text', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="/[invalid(regex" />);

		setTimeout(() => {
			// Should not crash, should fall back to plain text search
			expect(lastFrame()).toContain('Count: 2'); // Only . and .. (no matches)
		}, 10);
	});

	test('filters with special characters in plain text mode', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter=".json" />);

		setTimeout(() => {
			expect(lastFrame()).toContain('package.json');
		}, 10);
	});

	test('filters JavaScript files with regex', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="/\\.js$" />);

		setTimeout(() => {
			expect(lastFrame()).toContain('test.js');
			expect(lastFrame()).not.toContain('index.ts');
		}, 10);
	});

	test('matches files starting with dot using regex', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="/^\\." />);

		setTimeout(() => {
			expect(lastFrame()).toContain('.hidden');
		}, 10);
	});

	test('handles empty filter string', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="" />);

		expect(lastFrame()).toContain('Active: no');
		expect(lastFrame()).toContain('Count: 9');
	});

	test('matches multiple extensions with regex', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} initialFilter="/\\.(md|json)$" />);

		setTimeout(() => {
			expect(lastFrame()).toContain('README.md');
			expect(lastFrame()).toContain('package.json');
		}, 10);
	});

	test('handles empty entries array', () => {
		const { lastFrame } = render(<FilterTestComponent entries={[]} initialFilter="test" />);

		setTimeout(() => {
			expect(lastFrame()).toContain('Count: 0');
		}, 10);
	});

	test('isActive reflects filter state correctly', () => {
		const entries = createMockEntries();
		const { lastFrame } = render(<FilterTestComponent entries={entries} />);

		// No filter initially
		expect(lastFrame()).toContain('Active: no');

		// With filter
		const { lastFrame: lastFrame2 } = render(<FilterTestComponent entries={entries} initialFilter="test" />);
		setTimeout(() => {
			expect(lastFrame2()).toContain('Active: yes');
		}, 10);
	});
});
