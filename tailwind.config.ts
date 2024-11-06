import { join } from 'path';
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

// 1. Import the Skeleton plugin
import { skeleton } from '@skeletonlabs/tw-plugin';

const config = {
	// 2. Opt for dark mode to be handled via the class method
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		// 3. Append the path to the Skeleton package
		join(require.resolve(
			'@skeletonlabs/skeleton'),
			'../**/*.{html,js,svelte,ts}'
		)
	],
	extend: {
        colors: {
            'light-shade': '#FAFAF9',
            'light-accent': '#94A9A7',
            'brand': '#F69E2E',
            'dark-accent': '#905D3F',
            'dark-shade': '#14202A'
        },
        fontFamily: {
            sans: ['Inter var', ...defaultTheme.fontFamily.sans],
            title: ['Delicious Handrawn', ...defaultTheme.fontFamily.sans]
        }
    },
	plugins: [
        forms,
		// 4. Append the Skeleton plugin (after other plugins)
		skeleton
	]
} satisfies Config;

export default config;