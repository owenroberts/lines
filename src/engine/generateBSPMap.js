// https://www.roguebasin.com/index.php/Basic_BSP_Dungeon_generation
// https://eskerda.com/bsp-dungeon-generation/
// https://web.archive.org/web/20230421203555/https://gamedevelopment.tutsplus.com/tutorials/how-to-use-bsp-trees-to-generate-game-maps--gamedev-12268

import { random, randomInt, coinFlip, chance, assert } from '../../../cool/cool.js'
import { TileMap } from './TileMap.js';

/**
 * BSPTileTypes "enum"
 * @type {object} { WALL, ROOM, PATH, ROOM_PATH }
 */
export const BSPTileTypes = {
	WALL: 0,
	ROOM: 1,
	PATH: 2,
	ROOM_PATH: 3,
};

/**
 * generates a BSP Map with a tileMap, nodes, rooms and paths
 * @param  {object}  options - options for bsp map generation
 * @param  {number}  options.cols - columns in map
 * @param  {number}  options.rows - rows in map
 * @param  {number}  [options.maxNodes] - maximum nodes, or splits in map
 * @param  {number}  [options.minNodeSize] - min size of each node/area
 * @param  {number}  [options.maxNodeSize] - max size of each node/area
 * @param  {number}  [options.minRoomSize] - min size of room in node
 * @param  {boolean} [options.createPaths] - add paths between rooms
 * @param  {object}  [options.mapBuffer] - { w, h } buffer around map
 * @param  {object}  [options.roomBuffer] - { w, h } buffer between room and containing node
 * @param  {object}  [options.inject] - inject a specific node, room, or path
 * @return {object}  {tileMap, nodes, rooms, paths} - returns tileMap and BSP data
 */
export function generateBSPMap({ cols, rows, maxNodes=99, minNodeSize=1, maxNodeSize=99, minRoomSize=1, createPaths=true, mapBuffer={ w: 0, h: 0 }, roomBuffer={ w: 0, h: 0 }, inject=[] }) {

	assert(Number.isFinite(rows), "rows param must be number");
	assert(Number.isFinite(cols), "cols param must be number");

	const tileMap = new TileMap(cols, rows);

	// start assuming everything is a wall
	tileMap.setAreaProperty(0, 0, cols, rows, 'type', BSPTileTypes.WALL);

	let nodes = [];
	const rooms = [];
	const paths = [];

	function split(node) {

		// if the node is already split, no split
		if (node.a || node.b) return false;
		if (node.room) return false; // for injecting rooms

		// random chance of vertical split, weighted based on size, more likely to split larger side
		const verticalSplit = chance(node.w / (node.w + node.h));

		// if the split direction would result in split smaller than minNodeSize, no split
		if (minNodeSize > (verticalSplit ? node.h : node.w)) return false;

		// same for min room -- but maybe remove after injecting node or room
		if (minRoomSize > (verticalSplit ? node.h : node.w)) return false;

		// max node based on split direction
		const max = (verticalSplit ? node.h : node.w) - minNodeSize;

		// if max node is too small, no split
		if (minNodeSize > max) return false;
		if (minRoomSize > max) return false;

		const splitSize = Math.floor(random(minNodeSize, max));

		node.a = { 
			x: node.x,
			y: node.y,
			w: verticalSplit ? node.w : splitSize,
			h: verticalSplit ? splitSize : node.h,
		};

		node.b = {
			x: verticalSplit ? node.x : node.x + splitSize,
			y: verticalSplit ? node.y + splitSize : node.y,
			w: verticalSplit ? node.w : node.w - splitSize,
			h: verticalSplit ? node.h - splitSize : node.h,
		};

		return true;
	}

	function addRooms(node) {
		if (node.a || node.b) {
			if (node.a) addRooms(node.a);
			if (node.b) addRooms(node.b);
			if (node.a && node.b && createPaths) addPath(node.a, node.b);
		} else if (!node.room) {
			// calc w first to adjust x with buffer
			const w = randomInt(minRoomSize, node.w - roomBuffer.w * 2, false);
			const h = randomInt(minRoomSize, node.h - roomBuffer.h * 2, false);
			const x = randomInt(roomBuffer.w, node.w - w - roomBuffer.w, false);
			const y = randomInt(roomBuffer.h, node.h - h - roomBuffer.h, false);

			// room is possible (test for injected rooms/nodes ... )
			if (x >= 0 && y >= 0 && w <= node.w && h <= node.h) {
				node.room = { x: x + node.x, y: y + node.y, w, h};
				rooms.push(node.room);
			} else {
				console.log(minRoomSize, roomBuffer)
				console.warn('cant make room', node, { x, y, w, h });
			}
		}
	}

	function addPath(a, b) {
		// i removed +1 and -2 from tut, which was causing missing links
		// can i do this?
		if (!a.room || !b.room) return;

		// get start and end of the path
		let start = {
			x: randomInt(a.room.x + roomBuffer.w, a.room.x + a.room.w - roomBuffer.w * 2, false),
			y: randomInt(a.room.y + roomBuffer.h, a.room.y + a.room.h - roomBuffer.h * 2, false),
		};

		let end = {
			x: randomInt(b.room.x + roomBuffer.w, b.room.x + b.room.w - roomBuffer.w * 2, false),
			y: randomInt(b.room.y + roomBuffer.h, b.room.y + b.room.h - roomBuffer.h * 2, false),
		};

		// get delta x and y of path
		let dx = end.x - start.x;
		let dy = end.y - start.y;

		// draw straight line, or line between
		const dir = coinFlip(); // random split direction if needed
		if (dx < 0) { // going left
			if (dy < 0) { // going up
				paths.push({
					x: end.x,
					y: dir ? start.y : end.y,
					w: Math.abs(dx) + 1,
					h: 1,
				});

				paths.push({
					x: dir ? end.x : start.x,
					y: end.y,
					w: 1,
					h: Math.abs(dy) + 1,
				});
			} else if (dy > 0) { // going down
				paths.push({
					x: end.x,
					y: dir ? start.y : end.y,
					w: Math.abs(dx) + 1,
					h: 1,
				});

				paths.push({
					x: dir ? end.x : start.x,
					y: start.y,
					w: 1,
					h: dir ? Math.abs(dy) + 1 : Math.abs(dy), // 1 short (maybe fixed?)
				});
			} else { // no y change
				paths.push({ x: end.x, y: end.y, w: Math.abs(dx) + 1, h: 1, });
			}
		} else if (dx > 0) { // going right
			if (dy < 0) { // going up
				paths.push({
					x: start.x,
					y: dir ? end.y : start.y,
					w: Math.abs(dx) + 1,
					h: 1
				});

				paths.push({
					x: dir ? start.x : end.x,
					y: end.y,
					w: 1,
					h: Math.abs(dy) + 1,
				});
			} else if (dy > 0) { // going down
				paths.push({
					x: start.x,
					y: dir ? start.y : end.y,
					w: Math.abs(dx) + 1,
					h: 1
				});

				paths.push({
					x: dir ? end.x : start.x,
					y: start.y,
					w: 1,
					h: Math.abs(dy) + 1,
				});
			} else { // no y change
				paths.push({ x: start.x, y: start.y, w: Math.abs(dx) + 1, h: 1});
			}
		} else { // no x change
			paths.push({
				x: dy < 0 ? end.x : start.x,
				y: dy < 0 ? end.y : start.y,
				w: 1,
				h: Math.abs(dy) + 1,
			});
		}

	}

	const start = { 
		x: mapBuffer.w,
		y: mapBuffer.h,
		w: cols - mapBuffer.w * 2, 
		h: rows - mapBuffer.h * 2,
	};
	nodes.push(start);

	// inject first
	for (let i = 0; i < inject.length; i++) {
		if (inject[i].type === "room") {
			const { w, h, name } = inject[i];

			let roomAdded = false;
			let attemptCount = 0;

			while (!roomAdded) {
				if (attemptCount > 99) {
					console.log('params', { cols, rows, inject })
					throw new Error("can't add room to this map");
				}
				
				const result = split(start);
				if (!result) {
					attemptCount++;
					continue;
				}
				for (let i = 0; i < 2; i++) {
					if (roomAdded) continue;
					const node = i === 0 ? start.a : start.b;
					if (node.w < w || node.h < h) continue;

					// not dry .. 
					const x = randomInt(roomBuffer.w, node.w - w - roomBuffer.w, false);
					const y = randomInt(roomBuffer.h, node.h - h - roomBuffer.h, false);
					node.room = { name, x: x + node.x, y: y + node.y, w, h};
					rooms.push(node.room);
					nodes.push(start.a);
					nodes.push(start.b);
					roomAdded = true;
				}
			} 
		}
	}

	// split nodes
	let canSplitMore = true;
	while(canSplitMore && nodes.length < maxNodes) {
		canSplitMore = false;
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			// console.log(canSplitMore, i, node, maxNodes, maxNodeSize);
			if (!node.a && !node.b && nodes.length < maxNodes - 1) {
				if (node.w > maxNodeSize || node.h > maxNodeSize || chance(0.75)) {
					const result = split(node);
					// console.log('result', result);
					if (result) {
						nodes.push(node.a);
						nodes.push(node.b);
						canSplitMore = true;
					}
				}
			}
		}
	}

	// add rooms starting with first node
	// adds paths if createPaths = true
	addRooms(start);

	// update tileMap tiles (not sure this is really necessary ... )
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		tileMap.setAreaProperty(node.x, node.y, node.w, node.h, "nodeIndex", i);
	}

	for (let i = 0; i < rooms.length; i++) {
		const node = rooms[i];
		tileMap.setAreaProperty(node.x, node.y, node.w, node.h, "roomIndex", i);
		tileMap.setAreaProperty(node.x, node.y, node.w, node.h, "type", BSPTileTypes.ROOM);
	}

	for (let i = 0; i < paths.length; i++) {
		const node = paths[i];
		tileMap.setAreaProperty(node.x, node.y, node.w, node.h, "pathIndex", i);
		// path collection index?
		for (let x = node.x; x < node.x + node.w; x++) {
			for (let y = node.y; y < node.y + node.h; y++) {
				const type = tileMap.getTile(x, y).type === BSPTileTypes.ROOM ?
					BSPTileTypes.ROOM_PATH :
					BSPTileTypes.PATH;
				tileMap.setTileProperty(x, y, 'type', type);
			}
		}
	}

	return { tileMap, nodes, rooms, paths };
}