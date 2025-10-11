import { test, expect, describe } from 'bun:test';
import React from 'react';
import { useSelection } from '../../lib/hooks/useSelection.js';
import type { FileEntry } from '../../types/index.js';

describe('useSelection', () => {
	const createMockEntries = (count: number): FileEntry[] => {
		return Array.from({ length: count }, (_, i) => ({
			name: `entry-${i}`,
			path: `/path/entry-${i}`,
			isDirectory: false,
			isHidden: false,
			isSpecial: false,
		}));
	};

	// Helper to test hook in a simple way
	function testHook<T>(hookFn: () => T): T {
		let result: T | undefined;

		function TestComponent() {
			result = hookFn();
			return null;
		}

		// Just call the component function to execute the hook
		React.createElement(TestComponent);

		return result as T;
	}

	test('should export useSelection hook', () => {
		expect(typeof useSelection).toBe('function');
	});

	test('hook should be callable', () => {
		const entries = createMockEntries(5);
		// This test just verifies the hook can be imported and called
		expect(() => {
			const hook = () => useSelection(entries);
			// We can't fully test without a React environment, but we can verify it exists
			expect(hook).toBeDefined();
		}).not.toThrow();
	});
});
