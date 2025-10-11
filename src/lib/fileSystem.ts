import * as fs from 'node:fs';
import * as path from 'node:path';
import type { FileEntry, FileSystemError, DirectoryReadResult } from '../types/index.js';

/**
 * Read directory contents and return as FileEntry array
 */
export async function readDirectory(dirPath: string, showHidden: boolean = false): Promise<DirectoryReadResult> {
	try {
		const absolutePath = path.resolve(dirPath);

		// Try to read the directory
		const entries = await fs.promises.readdir(absolutePath, { withFileTypes: true });

		// Build file entries
		const fileEntries: FileEntry[] = [];

		// Add . (current directory) and .. (parent directory)
		fileEntries.push({
			name: '.',
			path: absolutePath,
			isDirectory: true,
			isHidden: false,
			isSpecial: true,
		});

		const parentPath = path.dirname(absolutePath);
		fileEntries.push({
			name: '..',
			path: parentPath,
			isDirectory: true,
			isHidden: false,
			isSpecial: true,
		});

		// Process directory entries
		for (const entry of entries) {
			const entryPath = path.join(absolutePath, entry.name);
			const isHidden = entry.name.startsWith('.');

			// Skip hidden files if not showing them
			if (isHidden && !showHidden) {
				continue;
			}

			// Follow symlinks to determine if they point to directories
			let isDirectory = entry.isDirectory();
			if (entry.isSymbolicLink()) {
				try {
					const stats = await fs.promises.stat(entryPath);
					isDirectory = stats.isDirectory();
				} catch {
					// If we can't follow the symlink, treat it as a file
					isDirectory = false;
				}
			}

			fileEntries.push({
				name: entry.name,
				path: entryPath,
				isDirectory,
				isHidden,
				isSpecial: false,
			});
		}

		// Sort: directories first, then files, alphabetically within each group
		fileEntries.sort((a, b) => {
			// Keep . and .. at the top, in that order
			if (a.isSpecial && b.isSpecial) {
				if (a.name === '.') return -1;
				if (b.name === '.') return 1;
				return 0;
			}
			if (a.isSpecial) return -1;
			if (b.isSpecial) return 1;

			// Directories before files
			if (a.isDirectory && !b.isDirectory) return -1;
			if (!a.isDirectory && b.isDirectory) return 1;

			// Alphabetically
			return a.name.localeCompare(b.name);
		});

		return { entries: fileEntries };
	} catch (error) {
		// Handle permission errors
		if ((error as NodeJS.ErrnoException).code === 'EACCES') {
			// Still return .. so user can navigate back
			const parentPath = path.dirname(path.resolve(dirPath));
			return {
				entries: [{
					name: '..',
					path: parentPath,
					isDirectory: true,
					isHidden: false,
					isSpecial: true,
				}],
				error: {
					type: 'permission',
					message: 'Permission denied',
					path: dirPath,
				},
			};
		}

		// Handle not found errors
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return {
				entries: [],
				error: {
					type: 'not_found',
					message: 'Directory not found',
					path: dirPath,
				},
			};
		}

		// Unknown error
		return {
			entries: [],
			error: {
				type: 'unknown',
				message: error instanceof Error ? error.message : 'Unknown error',
				path: dirPath,
			},
		};
	}
}

/**
 * Check if a file/directory name is hidden (starts with .)
 */
export function isHidden(name: string): boolean {
	return name.startsWith('.') && name !== '.' && name !== '..';
}

/**
 * Validate file/directory name (OS-specific)
 */
export function validateFileName(name: string): FileSystemError | null {
	if (!name || name.trim().length === 0) {
		return {
			type: 'invalid_name',
			message: 'Name cannot be empty',
		};
	}

	// Check for invalid characters (common across OS)
	const invalidChars = process.platform === 'win32'
		? /[<>:"|?*\x00-\x1f]/
		: /[\x00]/;

	if (invalidChars.test(name)) {
		return {
			type: 'invalid_name',
			message: 'Name contains invalid characters',
		};
	}

	// Check for path separators
	if (name.includes('/') || name.includes('\\')) {
		return {
			type: 'invalid_name',
			message: 'Name cannot contain path separators',
		};
	}

	// Check for reserved names on Windows
	if (process.platform === 'win32') {
		const reserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
		if (reserved.test(name)) {
			return {
				type: 'invalid_name',
				message: 'Name is reserved by the system',
			};
		}
	}

	// Check length (most systems have a 255 byte limit)
	if (Buffer.byteLength(name, 'utf8') > 255) {
		return {
			type: 'invalid_name',
			message: 'Name is too long',
		};
	}

	return null;
}

/**
 * Create a new directory
 */
export async function createDirectory(dirPath: string, name: string): Promise<FileSystemError | null> {
	// Validate name
	const validationError = validateFileName(name);
	if (validationError) {
		return validationError;
	}

	const targetPath = path.join(dirPath, name);

	try {
		await fs.promises.mkdir(targetPath);
		return null;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
			return {
				type: 'already_exists',
				message: 'Directory already exists',
				path: targetPath,
			};
		}

		if ((error as NodeJS.ErrnoException).code === 'EACCES') {
			return {
				type: 'permission',
				message: 'Permission denied',
				path: targetPath,
			};
		}

		return {
			type: 'unknown',
			message: error instanceof Error ? error.message : 'Unknown error',
			path: targetPath,
		};
	}
}

/**
 * Create a new file
 */
export async function createFile(dirPath: string, name: string): Promise<FileSystemError | null> {
	// Validate name
	const validationError = validateFileName(name);
	if (validationError) {
		return validationError;
	}

	const targetPath = path.join(dirPath, name);

	try {
		// Create empty file
		await fs.promises.writeFile(targetPath, '', { flag: 'wx' });
		return null;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
			return {
				type: 'already_exists',
				message: 'File already exists',
				path: targetPath,
			};
		}

		if ((error as NodeJS.ErrnoException).code === 'EACCES') {
			return {
				type: 'permission',
				message: 'Permission denied',
				path: targetPath,
			};
		}

		return {
			type: 'unknown',
			message: error instanceof Error ? error.message : 'Unknown error',
			path: targetPath,
		};
	}
}

/**
 * Rename a file or directory
 */
export async function renameFileOrDirectory(oldPath: string, newName: string): Promise<FileSystemError | null> {
	// Validate new name
	const validationError = validateFileName(newName);
	if (validationError) {
		return validationError;
	}

	const dirPath = path.dirname(oldPath);
	const newPath = path.join(dirPath, newName);

	// Don't allow renaming to the same name
	if (oldPath === newPath) {
		return null;
	}

	// Check if target already exists (fs.rename doesn't always throw error)
	try {
		await fs.promises.access(newPath);
		// If we get here, the file exists
		return {
			type: 'already_exists',
			message: 'Target already exists',
			path: newPath,
		};
	} catch {
		// File doesn't exist, we can proceed
	}

	try {
		await fs.promises.rename(oldPath, newPath);
		return null;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
			return {
				type: 'already_exists',
				message: 'Target already exists',
				path: newPath,
			};
		}

		if ((error as NodeJS.ErrnoException).code === 'EACCES') {
			return {
				type: 'permission',
				message: 'Permission denied',
				path: newPath,
			};
		}

		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return {
				type: 'not_found',
				message: 'Source not found',
				path: oldPath,
			};
		}

		return {
			type: 'unknown',
			message: error instanceof Error ? error.message : 'Unknown error',
			path: newPath,
		};
	}
}
