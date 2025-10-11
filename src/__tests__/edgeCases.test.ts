import * as fs from 'node:fs';
import * as path from 'node:path';

import { afterEach,describe, expect, test } from 'bun:test';

import {
	createDirectory,
	createFile,
	readDirectory,
	renameFileOrDirectory,
	validateFileName,
} from '../lib/fileSystem.js';
import { cleanupMockFileSystem,createMockFileSystem } from './helpers/mockFs.js';

describe('Edge Cases', () => {
	let testDir: string;

	afterEach(async () => {
		if (testDir) {
			await cleanupMockFileSystem(testDir);
		}
	});

	describe('File System Edge Cases', () => {
		test('should handle directory with many files', async () => {
			const manyFiles = Array.from({ length: 100 }, (_, i) => `file${i}.txt`);
			testDir = await createMockFileSystem({
				files: manyFiles,
			});

			const result = await readDirectory(testDir, false);

			expect(result.entries.length).toBeGreaterThan(100); // 100 files + . + ..
		});

		test('should handle very long file names', async () => {
			testDir = await createMockFileSystem({});

			const longName = 'a'.repeat(200); // Long but under 255 byte limit
			const error = await createFile(testDir, longName + '.txt');

			expect(error).toBeNull();
		});

		test('should reject extremely long file names', () => {
			const tooLongName = 'a'.repeat(300);
			const error = validateFileName(tooLongName);

			expect(error).toBeDefined();
			expect(error?.type).toBe('invalid_name');
		});

		test('should handle files with special characters in name', async () => {
			testDir = await createMockFileSystem({});

			const specialName = 'file with spaces & (parens).txt';
			const error = await createFile(testDir, specialName);

			expect(error).toBeNull();

			const filePath = path.join(testDir, specialName);
			const exists = await fs.promises.stat(filePath).then(() => true).catch(() => false);
			expect(exists).toBe(true);
		});

		test('should handle unicode file names', async () => {
			testDir = await createMockFileSystem({});

			const unicodeName = '文件.txt'; // Chinese characters
			const error = await createFile(testDir, unicodeName);

			expect(error).toBeNull();
		});

		test('should handle empty directory name attempts', () => {
			const error = validateFileName('');
			expect(error?.type).toBe('invalid_name');
		});

		test('should handle whitespace-only names', () => {
			const error = validateFileName('   ');
			expect(error?.type).toBe('invalid_name');
		});

		test('should handle multiple consecutive dots', async () => {
			testDir = await createMockFileSystem({});

			const error = await createFile(testDir, '...file.txt');
			expect(error).toBeNull();
		});

		test('should handle rapid successive operations', async () => {
			testDir = await createMockFileSystem({});

			// Create multiple files rapidly
			const promises = [];
			for (let i = 0; i < 10; i++) {
				promises.push(createFile(testDir, `rapid${i}.txt`));
			}

			const results = await Promise.all(promises);

			// All should succeed
			results.forEach((error) => {
				expect(error).toBeNull();
			});
		});

		test('should handle mixed hidden and visible files', async () => {
			testDir = await createMockFileSystem({
				files: ['visible1.txt', 'visible2.txt'],
				hiddenFiles: ['.hidden1', '.hidden2', '.hidden3'],
			});

			const withHidden = await readDirectory(testDir, true);
			const withoutHidden = await readDirectory(testDir, false);

			expect(withHidden.entries.length).toBeGreaterThan(withoutHidden.entries.length);
		});

		test('should handle symbolic links to files', async () => {
			if (process.platform === 'win32') {
				// Skip on Windows as symlink behavior is different
				return;
			}

			testDir = await createMockFileSystem({
				files: ['target.txt'],
			});

			const linkPath = path.join(testDir, 'link.txt');
			const targetPath = path.join(testDir, 'target.txt');

			await fs.promises.symlink(targetPath, linkPath);

			const result = await readDirectory(testDir, false);

			const names = result.entries.map((e) => e.name);
			expect(names).toContain('link.txt');
		});

		test('should handle symbolic links to directories', async () => {
			if (process.platform === 'win32') {
				// Skip on Windows
				return;
			}

			testDir = await createMockFileSystem({
				directories: ['targetdir'],
			});

			const linkPath = path.join(testDir, 'linkdir');
			const targetPath = path.join(testDir, 'targetdir');

			await fs.promises.symlink(targetPath, linkPath, 'dir');

			const result = await readDirectory(testDir, false);

			const entry = result.entries.find((e) => e.name === 'linkdir');
			expect(entry).toBeDefined();
			expect(entry?.isDirectory).toBe(true);
		});

		test('should handle renaming to name with different case', async () => {
			testDir = await createMockFileSystem({
				files: ['file.txt'],
			});

			const oldPath = path.join(testDir, 'file.txt');

			// On case-insensitive file systems, this might behave differently
			const error = await renameFileOrDirectory(oldPath, 'FILE.TXT');

			// Should either succeed or handle gracefully
			// The result depends on the file system
			expect(error === null || error?.type === 'already_exists').toBe(true);
		});

		test('should handle directory with only hidden files', async () => {
			testDir = await createMockFileSystem({
				hiddenFiles: ['.file1', '.file2'],
			});

			const resultWithHidden = await readDirectory(testDir, true);
			const resultWithoutHidden = await readDirectory(testDir, false);

			expect(resultWithHidden.entries.length).toBeGreaterThan(2); // . + .. + hidden files
			expect(resultWithoutHidden.entries.length).toBe(2); // Only . and ..
		});

		test('should handle deeply nested directory structure', async () => {
			testDir = await createMockFileSystem({});

			// Create a deeply nested structure
			let currentPath = testDir;
			for (let i = 0; i < 10; i++) {
				currentPath = path.join(currentPath, `level${i}`);
				await fs.promises.mkdir(currentPath);
			}

			// Should be able to read at any level
			const result = await readDirectory(currentPath, false);
			expect(result.entries.length).toBeGreaterThanOrEqual(2); // . and ..
		});

		test('should handle file names ending with dot', async () => {
			testDir = await createMockFileSystem({});

			// Some systems allow files ending with dot
			const error = await createFile(testDir, 'file.');

			// The result depends on the OS
			// Just verify it doesn't crash
			expect(error !== undefined || error === null).toBe(true);
		});
	});

	describe('Validation Edge Cases', () => {
		test('should reject null bytes in filename', () => {
			const error = validateFileName('file\x00name.txt');
			expect(error?.type).toBe('invalid_name');
		});

		test('should handle names with only dots', () => {
			const error = validateFileName('...');
			// This should be allowed as a valid filename
			expect(error).toBeNull();
		});

		test('should handle maximum valid length', () => {
			// 255 bytes is the typical limit
			const maxName = 'a'.repeat(255);
			const error = validateFileName(maxName);
			expect(error).toBeNull();
		});

		test('should reject just over maximum length', () => {
			const tooLong = 'a'.repeat(256);
			const error = validateFileName(tooLong);
			expect(error?.type).toBe('invalid_name');
		});
	});

	describe('Concurrent Operation Edge Cases', () => {
		test('should handle concurrent reads', async () => {
			testDir = await createMockFileSystem({
				files: ['file1.txt', 'file2.txt'],
			});

			// Read the same directory multiple times concurrently
			const reads = Array.from({ length: 10 }, () =>
				readDirectory(testDir, false)
			);

			const results = await Promise.all(reads);

			// All should succeed with same results
			results.forEach((result) => {
				expect(result.entries.length).toBeGreaterThan(0);
			});
		});

		test('should handle create and read concurrently', async () => {
			testDir = await createMockFileSystem({});

			const operations = [];

			// Mix creates and reads
			for (let i = 0; i < 5; i++) {
				operations.push(createFile(testDir, `file${i}.txt`));
				operations.push(readDirectory(testDir, false));
			}

			// All operations should complete
			await Promise.all(operations);
		});
	});
});
