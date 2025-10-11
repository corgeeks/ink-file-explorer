#!/usr/bin/env bun
/**
 * Build script for @corgeeks/ink-file-explorer
 *
 * This script:
 * 1. Cleans the dist/ directory
 * 2. Builds JavaScript files using Bun's bundler
 * 3. Generates TypeScript declaration files using tsc
 * 4. Adds shebang to demo executable
 */

import { rmSync } from 'node:fs';
import { chmod } from 'node:fs/promises';
import { join } from 'node:path';

const outdir = './dist';

// Step 1: Clean dist directory
console.log('🧹 Cleaning dist directory...');
try {
	rmSync(outdir, { recursive: true, force: true });
	console.log('✓ Cleaned dist directory');
} catch (error) {
	console.error('Failed to clean dist:', error);
	process.exit(1);
}

// Step 2: Build JavaScript with Bun
console.log('\n📦 Building JavaScript with Bun...');
try {
	const result = await Bun.build({
		entrypoints: [
			'./src/index.ts',
			'./src/main.tsx',
		],
		outdir,
		target: 'node',
		format: 'esm',
		sourcemap: 'external',
		// External dependencies that should not be bundled
		external: [
			'react',
			'ink',
			'prop-types',
		],
		naming: {
			entry: '[dir]/[name].js',
		},
	});

	if (!result.success) {
		console.error('Build failed:');
		for (const message of result.logs) {
			console.error(message);
		}
		process.exit(1);
	}

	console.log(`✓ Built ${result.outputs.length} files`);
	for (const output of result.outputs) {
		console.log(`  - ${output.path}`);
	}
} catch (error) {
	console.error('Build error:', error);
	process.exit(1);
}

// Step 3: Generate TypeScript declarations
console.log('\n📘 Generating TypeScript declarations...');
try {
	const proc = Bun.spawn(['bun', 'tsc', '--emitDeclarationOnly'], {
		stdout: 'inherit',
		stderr: 'inherit',
	});

	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		console.error('TypeScript declaration generation failed');
		process.exit(1);
	}

	console.log('✓ Generated TypeScript declarations');
} catch (error) {
	console.error('Failed to generate declarations:', error);
	process.exit(1);
}

// Step 4: Make demo executable
console.log('\n🔧 Setting up demo executable...');
try {
	const demoPath = join(outdir, 'main.js');

	// Read the file
	const file = Bun.file(demoPath);
	let content = await file.text();

	// Replace any existing shebang or add new one
	const shebang = '#!/usr/bin/env node\n';
	if (content.startsWith('#!')) {
		// Replace existing shebang
		const firstNewline = content.indexOf('\n');
		content = shebang + content.slice(firstNewline + 1);
	} else {
		content = shebang + content;
	}

	// Write back with shebang
	await Bun.write(demoPath, content);

	// Make executable
	await chmod(demoPath, 0o755);

	console.log('✓ Demo executable is ready');
} catch (error) {
	console.error('Failed to setup demo executable:', error);
	process.exit(1);
}

console.log('\n✨ Build completed successfully!\n');
