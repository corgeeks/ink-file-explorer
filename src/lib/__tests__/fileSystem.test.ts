import * as fs from 'node:fs';
import * as path from 'node:path';

import { afterEach,beforeEach, describe, expect, test } from 'bun:test';

import { cleanupMockFileSystem, createMockFileSystem, createRestrictedDirectory } from '../../__tests__/helpers/mockFs.js';
import {
	createDirectory,
	createFile,
	isHidden,
	readDirectory,
	renameFileOrDirectory,
	validateFileName,
} from '../fileSystem.js';

describe('fileSystem', () => {
	let testDir: string;

	afterEach(async () => {
		if (testDir) {
			await cleanupMockFileSystem(testDir);
		}
	});

	describe('readDirectory', () => {
		test('should read directory with files and folders', async () => {
			testDir = await createMockFileSystem({
				files: ['file1.txt', 'file2.md'],
				directories: ['dir1', 'dir2'],
			});

			const result = await readDirectory(testDir, false);

			expect(result.entries.length).toBeGreaterThanOrEqual(4); // . + .. + 2 dirs + 2 files
			expect(result.error).toBeUndefined();

			// Check for . and .. entries
			const dotEntry = result.entries.find((e) => e.name === '.');
			const dotDotEntry = result.entries.find((e) => e.name === '..');
			expect(dotEntry).toBeDefined();
			expect(dotDotEntry).toBeDefined();
			expect(dotEntry?.isSpecial).toBe(true);
			expect(dotDotEntry?.isSpecial).toBe(true);

			// Check that . comes before ..
			const dotIndex = result.entries.findIndex((e) => e.name === '.');
			const dotDotIndex = result.entries.findIndex((e) => e.name === '..');
			expect(dotIndex).toBe(0);
			expect(dotDotIndex).toBe(1);
		});

		test('should filter hidden files when showHidden is false', async () => {
			testDir = await createMockFileSystem({
				files: ['visible.txt'],
				hiddenFiles: ['.hidden.txt'],
				directories: ['visibleDir'],
				hiddenDirectories: ['.hiddenDir'],
			});

			const result = await readDirectory(testDir, false);

			const fileNames = result.entries.map((e) => e.name);
			expect(fileNames).toContain('visible.txt');
			expect(fileNames).toContain('visibleDir');
			expect(fileNames).not.toContain('.hidden.txt');
			expect(fileNames).not.toContain('.hiddenDir');
		});

		test('should include hidden files when showHidden is true', async () => {
			testDir = await createMockFileSystem({
				files: ['visible.txt'],
				hiddenFiles: ['.hidden.txt'],
			});

			const result = await readDirectory(testDir, true);

			const fileNames = result.entries.map((e) => e.name);
			expect(fileNames).toContain('visible.txt');
			expect(fileNames).toContain('.hidden.txt');
		});

		test('should sort directories before files', async () => {
			testDir = await createMockFileSystem({
				files: ['aFile.txt', 'zFile.txt'],
				directories: ['bDir', 'yDir'],
			});

			const result = await readDirectory(testDir, false);

			// Remove . and .. for this test
			const nonSpecialEntries = result.entries.filter((e) => !e.isSpecial);

			// First entries should be directories
			expect(nonSpecialEntries[0]?.isDirectory).toBe(true);
			expect(nonSpecialEntries[1]?.isDirectory).toBe(true);

			// Last entries should be files
			const lastTwo = nonSpecialEntries.slice(-2);
			expect(lastTwo[0]?.isDirectory).toBe(false);
			expect(lastTwo[1]?.isDirectory).toBe(false);
		});

		test('should sort entries alphabetically within type', async () => {
			testDir = await createMockFileSystem({
				files: ['zebra.txt', 'apple.txt', 'middle.txt'],
				directories: ['zoo', 'ant', 'middle-dir'],
			});

			const result = await readDirectory(testDir, false);

			const dirs = result.entries.filter((e) => e.isDirectory && !e.isSpecial);
			const files = result.entries.filter((e) => !e.isDirectory);

			// Directories should be sorted
			expect(dirs[0]?.name).toBe('ant');
			expect(dirs[1]?.name).toBe('middle-dir');
			expect(dirs[2]?.name).toBe('zoo');

			// Files should be sorted
			expect(files[0]?.name).toBe('apple.txt');
			expect(files[1]?.name).toBe('middle.txt');
			expect(files[2]?.name).toBe('zebra.txt');
		});

		test('should handle empty directory', async () => {
			testDir = await createMockFileSystem({});

			const result = await readDirectory(testDir, false);

			// Should still have . and ..
			expect(result.entries.length).toBe(2);
			expect(result.entries[0]?.name).toBe('.');
			expect(result.entries[1]?.name).toBe('..');
		});

		test('should handle permission errors', async () => {
			if (process.platform === 'win32') {
				// Skip this test on Windows as permission handling is different
				return;
			}

			testDir = await createRestrictedDirectory();
			const restrictedPath = path.join(testDir, 'no-access');

			const result = await readDirectory(restrictedPath, false);

			expect(result.error).toBeDefined();
			expect(result.error?.type).toBe('permission');
			// Should still have .. to navigate back
			expect(result.entries.length).toBe(1);
			expect(result.entries[0]?.name).toBe('..');
		});

		test('should handle non-existent directory', async () => {
			const nonExistentPath = '/path/that/does/not/exist';

			const result = await readDirectory(nonExistentPath, false);

			expect(result.error).toBeDefined();
			expect(result.error?.type).toBe('not_found');
		});

		test('should mark entries with correct isHidden flag', async () => {
			testDir = await createMockFileSystem({
				files: ['visible.txt'],
				hiddenFiles: ['.hidden.txt'],
			});

			const result = await readDirectory(testDir, true);

			const visible = result.entries.find((e) => e.name === 'visible.txt');
			const hidden = result.entries.find((e) => e.name === '.hidden.txt');

			expect(visible?.isHidden).toBe(false);
			expect(hidden?.isHidden).toBe(true);
		});

		test('should include absolute paths for entries', async () => {
			testDir = await createMockFileSystem({
				files: ['test.txt'],
			});

			const result = await readDirectory(testDir, false);

			const testFile = result.entries.find((e) => e.name === 'test.txt');
			expect(testFile?.path).toBe(path.join(testDir, 'test.txt'));
			expect(path.isAbsolute(testFile?.path || '')).toBe(true);
		});
	});

	describe('isHidden', () => {
		test('should return true for files starting with dot', () => {
			expect(isHidden('.hidden')).toBe(true);
			expect(isHidden('.gitignore')).toBe(true);
		});

		test('should return false for normal files', () => {
			expect(isHidden('visible.txt')).toBe(false);
			expect(isHidden('file.hidden')).toBe(false);
		});

		test('should return false for . and ..', () => {
			expect(isHidden('.')).toBe(false);
			expect(isHidden('..')).toBe(false);
		});
	});

	describe('validateFileName', () => {
		test('should accept valid file names', () => {
			expect(validateFileName('file.txt')).toBeNull();
			expect(validateFileName('my-file_123.md')).toBeNull();
			expect(validateFileName('a'.repeat(255))).toBeNull();
		});

		test('should reject empty names', () => {
			const error = validateFileName('');
			expect(error).toBeDefined();
			expect(error?.type).toBe('invalid_name');
		});

		test('should reject names with only whitespace', () => {
			const error = validateFileName('   ');
			expect(error).toBeDefined();
			expect(error?.type).toBe('invalid_name');
		});

		test('should reject names with path separators', () => {
			expect(validateFileName('file/name.txt')?.type).toBe('invalid_name');
			expect(validateFileName('file\\name.txt')?.type).toBe('invalid_name');
		});

		test('should reject names that are too long', () => {
			const longName = 'a'.repeat(256);
			const error = validateFileName(longName);
			expect(error).toBeDefined();
			expect(error?.type).toBe('invalid_name');
		});

		test('should reject null bytes', () => {
			const error = validateFileName('file\x00name.txt');
			expect(error).toBeDefined();
			expect(error?.type).toBe('invalid_name');
		});
	});

	describe('createDirectory', () => {
		test('should create a new directory', async () => {
			testDir = await createMockFileSystem({});

			const error = await createDirectory(testDir, 'newDir');

			expect(error).toBeNull();
			const dirPath = path.join(testDir, 'newDir');
			const stats = await fs.promises.stat(dirPath);
			expect(stats.isDirectory()).toBe(true);
		});

		test('should fail when directory already exists', async () => {
			testDir = await createMockFileSystem({
				directories: ['existing'],
			});

			const error = await createDirectory(testDir, 'existing');

			expect(error).toBeDefined();
			expect(error?.type).toBe('already_exists');
		});

		test('should validate directory name', async () => {
			testDir = await createMockFileSystem({});

			const error = await createDirectory(testDir, '');

			expect(error).toBeDefined();
			expect(error?.type).toBe('invalid_name');
		});

		test('should fail with invalid characters', async () => {
			testDir = await createMockFileSystem({});

			const error = await createDirectory(testDir, 'dir/with/slash');

			expect(error).toBeDefined();
			expect(error?.type).toBe('invalid_name');
		});
	});

	describe('createFile', () => {
		test('should create a new file', async () => {
			testDir = await createMockFileSystem({});

			const error = await createFile(testDir, 'newFile.txt');

			expect(error).toBeNull();
			const filePath = path.join(testDir, 'newFile.txt');
			const stats = await fs.promises.stat(filePath);
			expect(stats.isFile()).toBe(true);
		});

		test('should create empty file', async () => {
			testDir = await createMockFileSystem({});

			await createFile(testDir, 'empty.txt');

			const filePath = path.join(testDir, 'empty.txt');
			const content = await fs.promises.readFile(filePath, 'utf-8');
			expect(content).toBe('');
		});

		test('should fail when file already exists', async () => {
			testDir = await createMockFileSystem({
				files: ['existing.txt'],
			});

			const error = await createFile(testDir, 'existing.txt');

			expect(error).toBeDefined();
			expect(error?.type).toBe('already_exists');
		});

		test('should validate file name', async () => {
			testDir = await createMockFileSystem({});

			const error = await createFile(testDir, '');

			expect(error).toBeDefined();
			expect(error?.type).toBe('invalid_name');
		});
	});

	describe('renameFileOrDirectory', () => {
		test('should rename a file', async () => {
			testDir = await createMockFileSystem({
				files: ['old.txt'],
			});

			const oldPath = path.join(testDir, 'old.txt');
			const error = await renameFileOrDirectory(oldPath, 'new.txt');

			expect(error).toBeNull();

			const newPath = path.join(testDir, 'new.txt');
			const newExists = await fs.promises.stat(newPath).then(() => true).catch(() => false);
			const oldExists = await fs.promises.stat(oldPath).then(() => true).catch(() => false);

			expect(newExists).toBe(true);
			expect(oldExists).toBe(false);
		});

		test('should rename a directory', async () => {
			testDir = await createMockFileSystem({
				directories: ['oldDir'],
			});

			const oldPath = path.join(testDir, 'oldDir');
			const error = await renameFileOrDirectory(oldPath, 'newDir');

			expect(error).toBeNull();

			const newPath = path.join(testDir, 'newDir');
			const stats = await fs.promises.stat(newPath);
			expect(stats.isDirectory()).toBe(true);
		});

		test('should fail when target already exists', async () => {
			testDir = await createMockFileSystem({
				files: ['file1.txt', 'file2.txt'],
			});

			const oldPath = path.join(testDir, 'file1.txt');
			const error = await renameFileOrDirectory(oldPath, 'file2.txt');

			expect(error).toBeDefined();
			expect(error?.type).toBe('already_exists');
		});

		test('should fail when source does not exist', async () => {
			testDir = await createMockFileSystem({});

			const oldPath = path.join(testDir, 'nonexistent.txt');
			const error = await renameFileOrDirectory(oldPath, 'new.txt');

			expect(error).toBeDefined();
			expect(error?.type).toBe('not_found');
		});

		test('should validate new name', async () => {
			testDir = await createMockFileSystem({
				files: ['file.txt'],
			});

			const oldPath = path.join(testDir, 'file.txt');
			const error = await renameFileOrDirectory(oldPath, '');

			expect(error).toBeDefined();
			expect(error?.type).toBe('invalid_name');
		});

		test('should handle renaming to same name', async () => {
			testDir = await createMockFileSystem({
				files: ['file.txt'],
			});

			const oldPath = path.join(testDir, 'file.txt');
			const error = await renameFileOrDirectory(oldPath, 'file.txt');

			expect(error).toBeNull();
		});
	});
});
