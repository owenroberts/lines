export function setupSVGFilter(renderer) {
	const svgns = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(svgns, "svg");
	const defs = document.createElementNS(svgns, "defs");
	const filter = document.createElementNS(svgns, "filter");
	const feComponentTransfer = document.createElementNS(svgns, "feComponentTransfer");
	const feFuncA = document.createElementNS(svgns, "feFuncA");

	svg.setAttribute('style', 'position:absolute;z-index:-1;');
	svg.setAttribute('width', '0');
	svg.setAttribute('height', '0');

	document.body.appendChild(svg);
	svg.appendChild(defs);
	defs.appendChild(filter);

	filter.setAttribute('id', 'remove-alpha');
	filter.setAttribute('x', '0');
	filter.setAttribute('y', '0');
	filter.setAttribute('width', '100%');
	filter.setAttribute('height', '100%');
	filter.appendChild(feComponentTransfer);
	feComponentTransfer.appendChild(feFuncA);

	feFuncA.setAttribute('type', 'discrete');
	feFuncA.setAttribute('tableValues', '0 1');

	renderer.ctx.filter = 'url(#remove-alpha)';
}