import { TileTypes } from './TileMap.js';

class Tile {
	constructor(type) {
		this.tileType = TileTypes[type ?? "OFF"];
	}
}