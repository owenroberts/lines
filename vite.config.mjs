import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	server:	{ port: 5463 },
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
