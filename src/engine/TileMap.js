import { assert } from '../../../cool/cool.js';

/**
 * TileTypes "Enum"
 * @type {object} { OFF, ON }
 */
export const TileTypes = {
	OFF: 0,
	ON: 1,
};

/**
 * creates a TileMap class for use with TileSet
 * TileMap maps tile types, used by TileSet to add locations
 * tilemap creator func should have TileTypes enum
 */
export class TileMap {
	
	/**
	 * create tilemap matrix
	 * @param  {number} cols columns in tilemap
	 * @param  {number} rows rows in tilemap
	 */
	constructor(cols, rows) {
		this.tiles = []; // save tiles in array
		this.cols = cols;
		this.rows = rows;
		
		// populate matrix with tile type off/default (0)
		for (let x = 0; x < cols; x++) {
			for (let y = 0; y < rows; y++) {
				this.tiles[x + y * cols] = { type: TileTypes.OFF };
			}
		}
	}

	/**
	 * get tile at x,y position
	 * @param  {number} x - position
	 * @param  {number} y - position
	 * @return {object} tile - { type, ... }
	 */
	getTile(x, y) {
		return this.tiles[x + y * this.cols];
	}

	/**
	 * filter tiles by type
	 * @param  {number} type - from type "Enum"
	 * @return {array} - array of tiles
	 */
	getTilesByType(type) {
		return this.tiles.filter(t => t.type === type);
	}

	/**
	 * look up tile x,y position by index
	 * @param  {object} tile - the tile to look up
	 * @return {object} { x, y } - x,y position
	 */
	getPosition(tile) {
		return this.getIndexPosition(this.tiles.indexOf(tile));
	}

	/**
	 * set tile property value by xy grid position
	 * @param {number} x     x grid position
	 * @param {number} y     y grid position
	 * @param {string} property - property of tile to set
	 * @param {*} value - value to set property
	 */
	setTileProperty(x, y, property, value) {
		assert(this.tiles[x + y * this.cols] !== undefined, `Tile map tile does not exist at ${x} ${y}`);
		this.tiles[x + y * this.cols][property] = value;
	}

	/**
	 * set a property on an area of tiles
	 * @param {number} x - x grid position
	 * @param {number} y - y grid position
	 * @param {number} w - width of area
	 * @param {number} h - height of area
	 * @param {string} property - property of tile to set
	 * @param {*} value - value to set property
	 */
	setAreaProperty(x, y, w, h, property, value) {
		for (let _x = x; _x < x + w; _x++) {
			for (let _y = y; _y < y + h; _y++) {
				this.setTileProperty(_x, _y, property, value);
			}
		}
	}

	/**
	 * get x, y position of matrix at index
	 * @param  {number} index 
	 * @return {object} { x, y }
	 */
	getIndexPosition(index) {
		return { x: index % this.cols, y: Math.floor(index / this.cols) };
	}

	/**
	 * print text visualization of map in console
	 * @param  {string} [property="type"] - property to map, ie roomIndex,  
	 * @return {string} - string of map matrix for logging
	 */
	toString(property="type") {
		let str = '';
		for (let i = 0; i < this.rows; i++) {
			str += this.tiles
				.slice(i * this.cols, i * this.cols + this.cols)
				.map(t => t.hasOwnProperty(property) ? t[property] : "X")
				.join('·');
			str += '\n';
		}
		return str;
	}	
}