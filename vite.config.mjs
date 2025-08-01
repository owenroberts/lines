import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				game: resolve(__dirname, 'game/index.html'),
				editor: resolve(__dirname, 'editor/index.html'),
			},
		},
	},
});
