import { useState, useEffect } from 'react';
import { useStdout } from 'ink';

export interface TerminalSize {
	width: number;
	height: number;
	isMinimal: boolean; // true if height < 10 rows
}

/**
 * Hook for detecting terminal dimensions and handling resize events.
 * Returns current terminal width/height and a flag for minimal mode.
 */
export function useTerminalSize(): TerminalSize {
	const { stdout } = useStdout();

	const [size, setSize] = useState<TerminalSize>(() => {
		const width = stdout.columns || 80;
		const height = stdout.rows || 24;
		return {
			width,
			height,
			isMinimal: height < 10,
		};
	});

	useEffect(() => {
		const handleResize = () => {
			const width = stdout.columns || 80;
			const height = stdout.rows || 24;
			setSize({
				width,
				height,
				isMinimal: height < 10,
			});
		};

		// Listen for terminal resize events
		stdout.on('resize', handleResize);

		// Cleanup listener on unmount
		return () => {
			stdout.off('resize', handleResize);
		};
	}, [stdout]);

	return size;
}
