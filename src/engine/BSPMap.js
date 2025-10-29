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

export class BSPMap {

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
	static create({ cols, rows, maxNodes=99, minNodeSize=1, maxNodeSize=99, minRoomSize=1, createPaths=true, mapBuffer={ w: 0, h: 0 }, roomBuffer={ w: 0, h: 0 }, inject=[] }) {

		assert(Number.isFinite(rows), "rows param must be number");
		assert(Number.isFinite(cols), "cols param must be number");

		const map = {
			tileMap: new TileMap(cols, rows),
			nodes: [],
			rooms: [],
			paths: [],			
		};

		const config = {
			cols,
			rows,
			maxNodes,
			minNodeSize,
			maxNodeSize,
			minRoomSize,
			createPaths,
			mapBuffer,
			roomBuffer,
		};

		map.tileMap.setAreaProperty(0, 0, cols, rows, 'type', BSPTileTypes.WALL);

		const start = { 
			x: mapBuffer.w,
			y: mapBuffer.h,
			w: cols - mapBuffer.w * 2, 
			h: rows - mapBuffer.h * 2,
		};
		map.nodes.push(start);

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
					
					const result = this.split(start, config);
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
						map.rooms.push(node.room);
						map.nodes.push(start.a);
						map.nodes.push(start.b);
						roomAdded = true;
					}
				} 
			}
		}

		// split nodes
		let canSplitMore = true;
		while(canSplitMore && map.nodes.length < maxNodes) {
			canSplitMore = false;
			for (let i = 0; i < map.nodes.length; i++) {
				const node = map.nodes[i];
				// console.log(canSplitMore, i, node, maxNodes, maxNodeSize);
				if (!node.a && !node.b && map.nodes.length < maxNodes - 1) {
					if (node.w > maxNodeSize || node.h > maxNodeSize || chance(0.75)) {
						const result = this.split(node, config);
						// console.log('result', result);
						if (result) {
							map.nodes.push(node.a);
							map.nodes.push(node.b);
							canSplitMore = true;
						}
					}
				}
			}
		}

		// add rooms starting with first node
		// adds paths if createPaths = true
		this.addRooms(start, map, config);

		// update tileMap tiles (not sure this is really necessary ... )
		for (let i = 0; i < map.nodes.length; i++) {
			const node = map.nodes[i];
			map.tileMap.setAreaProperty(node.x, node.y, node.w, node.h, "nodeIndex", i);
		}

		for (let i = 0; i < map.rooms.length; i++) {
			const node = map.rooms[i];
			map.tileMap.setAreaProperty(node.x, node.y, node.w, node.h, "roomIndex", i);
			map.tileMap.setAreaProperty(node.x, node.y, node.w, node.h, "type", BSPTileTypes.ROOM);
		}

		for (let i = 0; i < map.paths.length; i++) {
			const node = map.paths[i];
			map.tileMap.setAreaProperty(node.x, node.y, node.w, node.h, "pathIndex", i);
			// path collection index?
			for (let x = node.x; x < node.x + node.w; x++) {
				for (let y = node.y; y < node.y + node.h; y++) {
					const type = map.tileMap.getTile(x, y).type === BSPTileTypes.ROOM ?
						BSPTileTypes.ROOM_PATH :
						BSPTileTypes.PATH;
					map.tileMap.setTileProperty(x, y, 'type', type);
				}
			}
		}

		return map;
	}

	static split(node, config) {

		// if the node is already split, no split
		if (node.a || node.b) return false;
		if (node.room) return false; // for injecting rooms

		// random chance of vertical split, weighted based on size, more likely to split larger side
		const verticalSplit = chance(node.w / (node.w + node.h));

		// if the split direction would result in split smaller than minNodeSize, no split
		if (config.minNodeSize > (verticalSplit ? node.h : node.w)) return false;

		// same for min room -- but maybe remove after injecting node or room
		if (config.minRoomSize > (verticalSplit ? node.h : node.w)) return false;

		// max node based on split direction
		const max = (verticalSplit ? node.h : node.w) - config.minNodeSize;

		// if max node is too small, no split
		if (config.minNodeSize > max) return false;
		if (config.minRoomSize > max) return false;

		const splitSize = Math.floor(random(config.minNodeSize, max));

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

	static addRooms(node, map, config) {
		if (node.a || node.b) {
			if (node.a) this.addRooms(node.a, map, config);
			if (node.b) this.addRooms(node.b, map, config);
			if (node.a && node.b && config.createPaths) this.addPath(node.a, node.b, map, config);
		} else if (!node.room) {
			// calc w first to adjust x with buffer
			const w = randomInt(config.minRoomSize, node.w - config.roomBuffer.w * 2, false);
			const h = randomInt(config.minRoomSize, node.h - config.roomBuffer.h * 2, false);
			const x = randomInt(config.roomBuffer.w, node.w - w - config.roomBuffer.w, false);
			const y = randomInt(config.roomBuffer.h, node.h - h - config.roomBuffer.h, false);

			// room is possible (test for injected rooms/nodes ... )
			if (x >= 0 && y >= 0 && w <= node.w && h <= node.h) {
				node.room = { x: x + node.x, y: y + node.y, w, h};
				map.rooms.push(node.room);
			} else {
				console.log(config.minRoomSize, config.roomBuffer)
				console.warn('cant make room', node, { x, y, w, h });
			}
		}
	}

	static addPath(a, b, map, config) {
		// i removed +1 and -2 from tut, which was causing missing links
		// can i do this?
		if (!a.room || !b.room) return;

		// get start and end of the path
		let start = {
			x: randomInt(a.room.x + config.roomBuffer.w, a.room.x + a.room.w - config.roomBuffer.w * 2, false),
			y: randomInt(a.room.y + config.roomBuffer.h, a.room.y + a.room.h - config.roomBuffer.h * 2, false),
		};

		let end = {
			x: randomInt(b.room.x + config.roomBuffer.w, b.room.x + b.room.w - config.roomBuffer.w * 2, false),
			y: randomInt(b.room.y + config.roomBuffer.h, b.room.y + b.room.h - config.roomBuffer.h * 2, false),
		};

		// get delta x and y of path
		let dx = end.x - start.x;
		let dy = end.y - start.y;

		// draw straight line, or line between
		const dir = coinFlip(); // random split direction if needed
		if (dx < 0) { // going left
			if (dy < 0) { // going up
				map.paths.push({
					x: end.x,
					y: dir ? start.y : end.y,
					w: Math.abs(dx) + 1,
					h: 1,
				});

				map.paths.push({
					x: dir ? end.x : start.x,
					y: end.y,
					w: 1,
					h: Math.abs(dy) + 1,
				});
			} else if (dy > 0) { // going down
				map.paths.push({
					x: end.x,
					y: dir ? start.y : end.y,
					w: Math.abs(dx) + 1,
					h: 1,
				});

				map.paths.push({
					x: dir ? end.x : start.x,
					y: start.y,
					w: 1,
					h: dir ? Math.abs(dy) + 1 : Math.abs(dy), // 1 short (maybe fixed?)
				});
			} else { // no y change
				map.paths.push({ x: end.x, y: end.y, w: Math.abs(dx) + 1, h: 1, });
			}
		} else if (dx > 0) { // going right
			if (dy < 0) { // going up
				map.paths.push({
					x: start.x,
					y: dir ? end.y : start.y,
					w: Math.abs(dx) + 1,
					h: 1
				});

				map.paths.push({
					x: dir ? start.x : end.x,
					y: end.y,
					w: 1,
					h: Math.abs(dy) + 1,
				});
			} else if (dy > 0) { // going down
				map.paths.push({
					x: start.x,
					y: dir ? start.y : end.y,
					w: Math.abs(dx) + 1,
					h: 1
				});

				map.paths.push({
					x: dir ? end.x : start.x,
					y: start.y,
					w: 1,
					h: Math.abs(dy) + 1,
				});
			} else { // no y change
				map.paths.push({ x: start.x, y: start.y, w: Math.abs(dx) + 1, h: 1});
			}
		} else { // no x change
			map.paths.push({
				x: dy < 0 ? end.x : start.x,
				y: dy < 0 ? end.y : start.y,
				w: 1,
				h: Math.abs(dy) + 1,
			});
		}
	}
}