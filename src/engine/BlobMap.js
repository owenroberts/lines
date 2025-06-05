// https://unit.dev/posts/blobmaps/
// useful description here: https://web.archive.org/web/20231026221613/http://www.cr31.co.uk/stagecast/wang/blob.html

import { assert } from '../../../cool/cool.js';

/**
 * bitmask order for blob map, indexOf maps to tilemap texture
 * see https://unit.dev/posts/blobmaps/ for order (need backup for this? ref image)
 * @type {Array}
 */
const bitMask48 = [
	0, 4, 68, 64, 117, 71, 197, 93, 7, 199, 215, 193,
	1, 5, 69, 65, 23, 223, 247, 209, 95, 255, 221, 241,
	17, 21, 85, 81, 29, 127, 253, 113, 31, 119, 'x', 245,
	16, 20, 84, 80, 219, 92, 116, 87, 28, 125, 124, 112,
];

/**
 * get blob index for tiles in TileMap
 */
export class BlobMap {

	/**
	 * blob map constructor
	 * @param  {TileMap} tileMap base tilemap used to get blobs
	 */
	constructor(tileMap) {
		assert(tileMap !== undefined, "a BlobMap needs a TileMap");
		this.tileMap = tileMap;
	}

	/**
	 * get the frame index for a texture based on blob map by position
	 * matches tileType to surrounding tiles
	 */
	getBlobIndex(x, y, tileType) {
		const s = this.getMatrixCellBinaryString(x, y, tileType);
		const n = this.getWangBlobNum(s);
		return bitMask48.indexOf(n);
	}

	getMatrixCellBinaryString(x, y, v) {
		return [
			this.getMatrixCellNum(x    , y - 1) === v ? 1 : 0,
			this.getMatrixCellNum(x + 1, y - 1) === v ? 1 : 0,
			this.getMatrixCellNum(x + 1, y    ) === v ? 1 : 0,
			this.getMatrixCellNum(x + 1, y + 1) === v ? 1 : 0,
			this.getMatrixCellNum(x    , y + 1) === v ? 1 : 0,
			this.getMatrixCellNum(x - 1, y + 1) === v ? 1 : 0,
			this.getMatrixCellNum(x - 1, y    ) === v ? 1 : 0,
			this.getMatrixCellNum(x - 1, y - 1) === v ? 1 : 0,
		].join('').toString();
	}

	getMatrixCellNum(x, y, includeEdges=false) {
		if (x < 0 || y < 0 || x >= this.tileMap.cols || y >= this.tileMap.rows) {
			return -1;
		} else {
			return this.tileMap.tiles[x + y * this.tileMap.cols].type;
		}
	}

	getWangBlobNum(binaryString) {
		let array = binaryString.split('').map(n => Boolean(+n));
		let [t, tr, r, br, b, bl, l, tl] = array;
		if (!(t && l)) tl = 0;
		if (!(t && r)) tr = 0;
		if (!(b && l)) bl = 0;
		if (!(b && r)) br = 0;

		let tot = 0;
		if (t) 	tot += (1 << 0);
		if (tr)	tot += (1 << 1);
		if (r)	tot += (1 << 2);
		if (br)	tot += (1 << 3);
		if (b) 	tot += (1 << 4);
		if (bl)	tot += (1 << 5);
		if (l)	tot += (1 << 6);
		if (tl)	tot += (1 << 7);

		return tot;
	}
}