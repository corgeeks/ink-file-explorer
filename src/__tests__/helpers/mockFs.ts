/**
 * Mock file system utilities for testing
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export interface MockFileSystemOptions {
	files?: string[];
	directories?: string[];
	hiddenFiles?: string[];
	hiddenDirectories?: string[];
}

/**
 * Create a temporary test directory with mock file structure
 */
export async function createMockFileSystem(options: MockFileSystemOptions = {}): Promise<string> {
	const {
		files = [],
		directories = [],
		hiddenFiles = [],
		hiddenDirectories = [],
	} = options;

	// Create a temporary directory
	const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ink-explorer-test-'));

	// Create directories
	for (const dir of directories) {
		await fs.promises.mkdir(path.join(tempDir, dir), { recursive: true });
	}

	// Create hidden directories
	for (const dir of hiddenDirectories) {
		await fs.promises.mkdir(path.join(tempDir, dir), { recursive: true });
	}

	// Create files
	for (const file of files) {
		const filePath = path.join(tempDir, file);
		await fs.promises.writeFile(filePath, `Mock content for ${file}`);
	}

	// Create hidden files
	for (const file of hiddenFiles) {
		const filePath = path.join(tempDir, file);
		await fs.promises.writeFile(filePath, `Mock content for ${file}`);
	}

	return tempDir;
}

/**
 * Clean up a temporary test directory
 */
export async function cleanupMockFileSystem(dirPath: string): Promise<void> {
	try {
		// Try to restore permissions on all subdirectories before deletion
		if (process.platform !== 'win32') {
			try {
				const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
				for (const entry of entries) {
					const fullPath = path.join(dirPath, entry.name);
					if (entry.isDirectory()) {
						try {
							await fs.promises.chmod(fullPath, 0o755);
						} catch {
							// Ignore permission restoration errors
						}
					}
				}
			} catch {
				// Ignore readdir errors
			}
		}

		await fs.promises.rm(dirPath, { recursive: true, force: true });
	} catch (error) {
		// Ignore cleanup errors
		console.warn(`Failed to cleanup test directory: ${dirPath}`, error);
	}
}

/**
 * Create a directory with permission restrictions for testing
 */
export async function createRestrictedDirectory(): Promise<string> {
	const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ink-explorer-restricted-'));

	// Create a subdirectory with no read permissions
	const restrictedDir = path.join(tempDir, 'no-access');
	await fs.promises.mkdir(restrictedDir);

	// Remove read permissions (on Unix-like systems)
	if (process.platform !== 'win32') {
		await fs.promises.chmod(restrictedDir, 0o000);
	}

	return tempDir;
}
