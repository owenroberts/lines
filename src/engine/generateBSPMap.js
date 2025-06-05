// https://www.roguebasin.com/index.php/Basic_BSP_Dungeon_generation
// https://eskerda.com/bsp-dungeon-generation/
// https://web.archive.org/web/20230421203555/https://gamedevelopment.tutsplus.com/tutorials/how-to-use-bsp-trees-to-generate-game-maps--gamedev-12268

import { random, randomInt, coinFlip } from '../../../cool/cool.js'
import { TileMap } from './TileMap.js';

/**
 * BSPTileTypes "Enum"
 * @type {Object}
 */
export const BSPTileTypes = {
	WALL: 0,
	ROOM: 1,
	PATH: 2,
	ROOM_PATH: 3,
};

export function generateBSPMap({ cols, rows, maxNodes=99, minNodeSize=1, maxNodeSize=99, minRoomSize=3, createPaths=true, mapBuffer={ w: 0, h: 0 }, roomBuffer={ w: 0, h: 0 }, }) {

	const tileMap = new TileMap(cols, rows);

	// start assuming everything is a wall
	tileMap.setAreaProperty(0, 0, cols, rows, 'type', BSPTileTypes.WALL);

	const nodes = [];
	const rooms = [];
	const paths = [];

	function split(node) {

		// if the node is already split, no split
		if (node.a || node.b) return false;

		// random chance of vertical split, weighted based on size (test this weight?)
		const verticalSplit = Math.random() > (node.w / (node.w + node.h));

		// if the split direction would result in split smaller than minNodeSize, no split
		if (minNodeSize > (verticalSplit ? node.h : node.w)) return false;

		// max node based on split direction
		const max = (verticalSplit ? node.h : node.w) - minNodeSize;

		// if max node is too small, no split
		if (minNodeSize > max) return false;

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
		} else {
			// calc w first to adjust x with buffer
			const w = randomInt(minRoomSize, node.w - roomBuffer.w * 2, false);
			const h = randomInt(minRoomSize, node.h - roomBuffer.h * 2, false);
			const x = randomInt(roomBuffer.w, node.w - w - roomBuffer.w);
			const y = randomInt(roomBuffer.h, node.h - h - roomBuffer.h);
			node.room = { x: x + node.x, y: y + node.y, w, h};
			rooms.push(node.room);
		}
	}

	function addPath(a, b) {
		// i removed +1 and -2 from tut, which was causing missing links
		// can i do this?
		if (!a.room || !b.room) return;

		// get start and end of the path
		let start = {
			x: randomInt(a.room.x + 1, a.room.x + a.room.w - 2, false),
			y: randomInt(a.room.y + 1, a.room.y + a.room.h - 2, false),
		};

		let end = {
			x: randomInt(b.room.x + 1, b.room.x + b.room.w - 2, false),
			y: randomInt(b.room.y + 1, b.room.y + b.room.h - 2, false),
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

	nodes.push({ 
		x: mapBuffer.w,
		y: mapBuffer.h,
		w: cols - mapBuffer.w * 2, 
		h: rows - mapBuffer.h * 2,
	});

	// will be overwritten ... does it matter if in multiple nodes?

	// split nodes
	let canSplitMore = true;
	while(canSplitMore && nodes.length < maxNodes) {
		canSplitMore = false;

		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			if (!node.a && !node.b && nodes.length < maxNodes - 1) {
				if (node.w > maxNodeSize || node.h > maxNodeSize) {
					const result = split(node);
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
	// this adds paths if they exist
	addRooms(nodes[0]);

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