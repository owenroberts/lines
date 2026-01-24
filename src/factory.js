/* factory funcs for POJOs */

export function createStyle({
	color='#000000',
	lineWidth=1,
	segmentNum= 2,
	jiggleRange=1,
	wiggleRange=1,
	wiggleSpeed=0.1,
	wiggleSegments=false,
	breaks=false,
	linesInterval=5,
}={}) {
	return { color, lineWidth,segmentNum,jiggleRange,wiggleRange,wiggleSpeed,wiggleSegments,breaks,linesInterval, };
}

export function createKeyframeChannel({ prop, frames=[] }) {
	return { prop, frames };
}

export function createTween({ prop, startFrame, endFrame, startValue, endValue }) {
	return { prop, startFrame, endFrame, startValue, endValue };
}

export function createClip({ start, end, dir=1, loop=true}) {
	return { start, end, dir, loop };
}

export function createSequence({ name, clips=[], clipIndex=0 }) {
	return { name, clips, clipIndex };
}

export function createSequenceClip({ name, repeat=1, dir=1, count= 0 }) {
	return { name, repeat, dir, count };
}
