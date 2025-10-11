/**
 * Test utilities for React components and hooks
 */
import React from 'react';
import { render as inkRender } from 'ink-testing-library';

/**
 * Custom render function that wraps ink-testing-library
 */
export function render(component: React.ReactElement) {
	return inkRender(component);
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
	condition: () => boolean,
	options: { timeout?: number; interval?: number } = {}
): Promise<void> {
	const { timeout = 5000, interval = 50 } = options;
	const startTime = Date.now();

	while (!condition()) {
		if (Date.now() - startTime > timeout) {
			throw new Error('Timeout waiting for condition');
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}
}

/**
 * Simulate keyboard input
 */
export function createKeyPress(key: string, options: { ctrl?: boolean; meta?: boolean } = {}) {
	return {
		input: key,
		key: {
			ctrl: options.ctrl || false,
			meta: options.meta || false,
			upArrow: key === 'upArrow',
			downArrow: key === 'downArrow',
			leftArrow: key === 'leftArrow',
			rightArrow: key === 'rightArrow',
			return: key === 'return',
			escape: key === 'escape',
			backspace: key === 'backspace',
		},
	};
}
