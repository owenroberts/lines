/**
 * lines version, for file converstion
 * @type {string}
 */
export const LINES_VERSION = "2.7";

/**
 * enum for terminal point types in Drawing
 * @type {object} "Enum"
 */
export const Points = {
	END: 0,
	ADD: 1,
};

/**
 * list of properties that need to be rounded to avoid floating point errors for keyframe animations
 * propably a better way to deal this right?
 * @type {array}
 */
export const INT_PROP_LIST = [
	"startIndex",
	"endIndex",
];

/**
 * list of props that can be keyframed
 * @type {array}
 */
export const KEYFRAME_PROP_LIST = [
	"segmentNum",
	"jiggleRange",
	"wiggleRange",
	"wiggleSpeed",
	"linesInterval",
	"startIndex", 
	"endIndex",
];