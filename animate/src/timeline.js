import { UILayer } from './ui-layer.js';
import { UITween } from './ui-tween.js';
import { UITimelineGroup } from './ui-timeline-group.js';
import { UIButton, UIElement, UIPanel, UILabel, UIModal } from '../../../oi/src/oi.js';
import { Points } from '../../src/lines.js';

export class TimelinePanel extends UIPanel {
	constructor(ui, anim) {
		super({ id: "timeline", ui });

		this.anim = anim;

		this.frameWidth = 120; // not part of ui ... either make part of ui or member var
		
		// is?
		this.viewLayers = true;
		this.viewActiveLayers = false;
		this.viewLayerRange = 0;
		this.viewGroups = true;
		this.viewState = false;
		
		this.lastGroup; // set last group
		this.useScrollToFrame = false;
		this.autoFit = false;

		this.tlSteps = [1, 2, 4, 5, 6, 10, 12, 20, 30, 40, 50, 100, 200, 500, 1000];
		this.tlInc = 1;
		this.tlWidth = 0;
		this.tlFrameWidth = 0;

		this.addRef({
			label: "layer",
			obj: anim,
			ref: "activeLayerIndex",
			ignoreSettings: true,
			callback: () => {
				this.ui.panels.styles.setStyleIndex(this.anim.activeLayer.styleIndex);
			}
		});

		this.addButton({
			text: "l",
			class: "left-end",
			key: "y",
			callback: () => {
				const m = new UIModal({
					title: "layers",
					ui: this.ui,
				});

				for (let i = 0; i < this.anim.layers.length; i++) {
					m.add(new UIButton({
						text: i,
						callback: () => {
							this.children.activeLayerIndex.update(i);
							this.ui.panels.styles.setStyleIndex(this.anim.activeLayer.styleIndex);
							m.clear();
						}
					}));
				}
			}
		});

		this.addButton({
			text: "e",
			key: "t",
			class: "right-end",
			callback: () => {
				this.timelineRow.children[`layer-${anim.activeLayerIndex}`].editModal();
			}
		});
	
		this.addRefs({ obj: this, }, [
			{
				ref: "viewGroups",
				text: "g",
				noLabel: true,
				noRow: true,
				key: "backslash",
				type: "UIToggle",
				callback: value => { this.update(); },
			},
			{
				ref: "viewLayers",
				key: "[",
				text: "V",
				class: "left-end",
				noLabel: true,
				noRow: true,
				type: "UIToggle",
				callback: () => { this.update(); },
			},
			{
				ref: "viewActiveLayers",
				key: ']',
				text: 'V', // toggle text in check ??
				class: 'right-end',
				noLabel: true,
				noRow: true,
				type: "UIToggle",
				callback: value => { this.update(); }
			},
			{
				ref: "useScrollToFrame",
				text: 'follow',
				noLabel: true,
				type: "UIToggle",
			},
			{
				ref: "viewLayerRange",
				label: "view range",
				range: [0, 10],
			}
		]);


		this.addButton({
			text: "add group",
			callback: () => {
				const newGroup = prompt("group name?");
				if (this.anim.groups.includes(newGroup)) {
					alert(`group ${newGroup} exists`);
					return;
				}
				if (newGroup) {
					if (!this.anim.hasOwnProperty("groups")) {
						this.anim.groups = [];
					}
					this.anim.groups.push(newGroup);
				}
			}
		});

		// { callback: scrollToFrame, key: 'shift-f', text: '⊙', args: [true], },
		// { callback: fit, text: '⇿', key: 'alt-f', class: 'left-end', },	
		// { callback: fitFrame, text: '⏛', key: 'ctrl-f', class: 'right-end', },

		this.addButtons(
			{ obj: this, },
			[
				{ 
					ref: "select", 
					key: 'shift-v', 
					class: 'left-end', 
				},
				{ 
					callback: () => { this.select(false); }, 
					text: 'deselect', 
					key: 'alt-d', 
					class: 'right-end',
				},
				{ 
					ref: "lock", 
					key: 'shift-l', 
					class: 'left-end',
				},
				{ 
					callback: () => { this.lock(false); },
					text: 'unlock', 
					key: 'alt-l',
					class: 'right-end',
				},
				{ ref: "split", },
				{ ref: "layersToEnd", key: 'alt-e', },
			]
		);

		// 'autoFit': {
		
		this.addRef({
			face: "clipSelect",
			key: "ctrl-t",
			label: "clip",
			value: "default",
			ignoreSettings: true,
			options: this.anim.clips.names,
			callback: value => {
				this.ui.panels.clips.set(value);
			}
		});

		this.bigFrameDisplay = this.add(new UILabel({
			text: '0',
			id: 'big-frame-display'
		}));

		this.timelineRow = this.addRow({ id: "timeline" });
	}

	init() {
		this.el.addEventListener('mousemove', ev => {
			// quick select while moving over frames
			if (ev.which == 1 && ev.target.classList.contains('frame') && 
				this.anim.currentFrame != +ev.target.textContent) {
				this.ui.panels.styles.reset();
				this.ui.panels.playback.setFrame(+ev.target.textContent);
				this.ui.update();
			} else if (ev.which == 3) {
				// scroll right/left -- do this shit ...
			}
		});
	}

	scrollToFrame(overrideScroll) {
		if (!this.useScrollToFrame && !overrideScroll) return;
		const closestFrame = Math.round(this.anim.currentFrame / this.tlInc) * this.tlInc;
		this.timelineRow.el.scrollTo(this.timelineRow.children[`frm-${closestFrame}`].el.offsetLeft - 10, 0);
	}

	/* creates all the layer ui new each time */
	update() {
		let prevFrame = this.ui.faces.currentFrame.value;
		this.ui.faces.currentFrame.value = this.anim.currentFrame;
		this.bigFrameDisplay.setText(this.anim.currentFrame);
		
		if (!this.anim.isPlaying) {
			this.timelineRow.clear();
			// if (autoFit) fit();
			this.drawFrames();
			this.drawLayers();
		} else {
			this.updateFrame(prevFrame);
		}
	}

	updateFrame(prevFrame) {
		let prevFrameDisplay = Math.floor(prevFrame / this.tlInc) * this.tlInc;
		let nextFrameDisplay = Math.floor(this.anim.currentFrame / this.tlInc) * this.tlInc;

		if (prevFrameDisplay === nextFrameDisplay) return;

		// error fix after moving timeline update to after anim update 

		if (this.timelineRow.children['frm-' + nextFrameDisplay]) {
			this.timelineRow.children['frm-' + nextFrameDisplay].addClass('current');
		}

		if (this.timelineRow.children['frm-' + prevFrameDisplay]) {

			this.timelineRow.children['frm-' + prevFrameDisplay].removeClass('current');
		}
	}

	drawFrames() {
		this.timelineRow.setStyle('--num-frames', this.anim.endFrame + 1);

		// skip frames at various thresholds
		const numFrames = this.anim.endFrame + 1;
		this.tlWidth = this.el.clientWidth - 11; /* 11 for padding */
		const maxFrameWidth = this.tlWidth / numFrames;
		this.frameWidth = Math.floor(this.tlWidth / numFrames); // +1 ??

		if (this.tlWidth < 0) return;
		const minFrameWidth = 24;
		let nFrameWidth = maxFrameWidth;
		
		let index = 0;
		while (nFrameWidth < minFrameWidth) {
			nFrameWidth = this.tlWidth / (numFrames / this.tlSteps[index]);
			index++;
		}
		this.tlInc = this.tlSteps[index];
		
		const nf = Math.floor(numFrames / this.tlInc) + 1;
		this.tlFrameWidth = Math.floor(this.tlWidth / nf) - 2; // border ... 

		this.timelineRow.setStyle('--num-frames', nf);
		this.timelineRow.setStyle('--frame-width', this.tlFrameWidth);

		for (let i = 0; i < numFrames; i += this.tlInc) {
			const frameBtn = new UIButton({
				text: `${i}`,
				css: {
					gridColumnStart:  1 + (Math.floor(i / this.tlInc) * 2),
					gridColumnEnd:  3 + (Math.floor(i / this.tlInc) * 2)
				},
				class: 'frame',
				callback: () => {
					this.ui.panels.styles.reset();
					this.ui.panels.playback.setFrame(i);
					this.ui.update();
				}	
			});
			// if (i === this.anim.currentFrame) frameBtn.addClass('current');
			if (Math.floor(i / this.tlInc) === Math.floor(this.anim.currentFrame / this.tlInc)) {
				frameBtn.addClass('current');
			}
			// this.ui.keys[i] = frameBtn;
			this.timelineRow.append(frameBtn, `frm-${i}`);
		}

		if (this.anim.clips.current.name !== 'default') {
			this.timelineRow.setStyle('--clip-height', 1);
			const clipLine = new UIElement({
				class: 'clip',
				css: {
					gridColumnStart: Math.floor(this.anim.clips.current.start / this.tlInc) * 2 + 1,
					gridColumnEnd: Math.floor((this.anim.clips.current.end + 1) / this.tlInc) * 2 + 1,
				}
			});
			this.timelineRow.append(clipLine);
		} else {
			this.timelineRow.setStyle('--clip-height', 0);
		}
		
		this.scrollToFrame();
	}

	drawLayers() {
		if (!this.viewLayers) return;

		let rowCount = 0; // set rows
		let tweenCount = 0; // tweens

		const layers = this.viewActiveLayers ?
			this.anim.layers.filter(layer => {
				const f = this.anim.currentFrame;
				for (let i = f - this.viewLayerRange; i <= f + this.viewLayerRange; i++) {
					if (layer.isInFrame(i)) return true;
				}
				return false;
			}) :
			this.anim.layers;

		let gridRowStart = 2;
		let gridRowEnd = 3;

		
		if (this.viewGroups && this.anim.groups.length > 0) {
			for (let i = 0, len = this.anim.groups.length; i < len; i++) {
				const group = this.anim.groups[i];
				let groupLayers = layers.filter(l => l.group === group);
				
				const startFrame = groupLayers.reduce((a, b) => { 
					return a.startFrame < b.startFrame ? a : b;
				}).startFrame;
				
				const endFrame = groupLayers.reduce((a, b) => { 
					return a.endFrame < b.endFrame ? a : b;
				}).endFrame;

				groupLayers.forEach(layer => {
					if (layer.startFrame !== startFrame) layer.startFrame = startFrame;
					if (layer.endFrame !== startFrame) layer.endFrame = endFrame;
				});

				const tlGroup = new UITimelineGroup(groupLayers, {
					anim: this.anim,
					ui: this.ui,
					name: this.anim.groups[i],
					index: i,
					class: 'group',
					startFrame: startFrame,
					endFrame: endFrame,
					width: this.frameWidth * (endFrame - startFrame + 1),
					css: {
						gridRowStart: gridRowStart, // 2 + (i * 2),
						gridRowEnd: gridRowEnd, 	// 3 + (i * 2),
						gridColumnStart: startFrame * 2 + 1,
						gridColumnEnd: endFrame * 2 + 3
					},
					update: () => { this.ui.update(); },
					reset: () => { this.resetLayers(); },
					moveUp: () => {
						// not sure this will work ...
						groupLayers.forEach(layer => {
							const layerIndex = this.anim.layers.indexOf(layer);
							const swapIndex = layerIndex - 1;
							swapLayer(layerIndex, swapIndex);
						});
					},
					moveToBack: () => {
						// go backwards to keep the order
						for (let i = groupLayers.length - 1; i >= 0; i--) {
							const layerIndex = this.anim.layers.indexOf(groupLayers[i]);
							sortLayer(layerIndex, 0);
						}
					}
				});
				gridRowStart += 2;
				gridRowEnd += 2;
				rowCount++;
				this.timelineRow.append(tlGroup, `group-${i}`);
			}
		}

		for (let i = 0, len = this.anim.layers.length; i < len; i++) {
			const layer = this.anim.layers[i];
			if (layer.group && this.viewGroups) continue;
			if (this.viewActiveLayers && !layers.includes(layer)) continue;

			const colWidth = (this.tlFrameWidth + 2) * (Math.floor(layer.endFrame / this.tlInc) - Math.floor(layer.startFrame / this.tlInc) + 1);
			
			const uiLayer = new UILayer({
				index: i,
				layer,
				anim: this.anim,
				ui: this.ui,
				canMoveUp: i > 0 && layers.length > 2,
				type: 'layer',
				width: colWidth,
				css: {
					width: colWidth + 'px',
					gridRowStart: gridRowStart, // 2 + (i * 2),
					gridRowEnd: gridRowEnd, 	// 3 + (i * 2),
					gridColumnStart: Math.floor(layer.startFrame / this.tlInc) * 2 + 1,
					gridColumnEnd: Math.floor(layer.endFrame / this.tlInc) * 2 + 3
				}
			});

			gridRowStart += 2;
			gridRowEnd += 2;
			rowCount++;
			this.timelineRow.append(uiLayer, `layer-${i}`);

			/* add tweens -- add methods like getTweens */
			for (let j = 0; j < layer.tweens.length; j++) {
				const tween = layer.tweens[j];
				const tweenColWidth = (this.tlFrameWidth + 2) * (Math.floor(tween.endFrame / this.tlInc) - Math.floor(tween.startFrame / this.tlInc) + 1);
				
				const uiTween = new UITween({
					ui: this.ui,
					type: 'tween',
					css: {
						width: tweenColWidth + 'px',
						gridRowStart: gridRowStart, 
						gridRowEnd: gridRowEnd, 
						gridColumnStart: Math.floor(tween.startFrame / this.tlInc) * 2 + 1,
						gridColumnEnd: Math.floor(tween.endFrame / this.tlInc) * 2 + 3
					},
					update: () => { this.ui.update(); },
				}, tween, layer);
				
				this.timelineRow.append(uiTween, `tween-${j}-layer-${i}`);
				tweenCount++;
				gridRowStart += 2;
				gridRowEnd += 2;
			}
		}

		this.timelineRow.setStyle('--num-layers', rowCount);
		this.timelineRow.setStyle('--num-tweens', tweenCount);
	}

	split() {
		for (let i = 0, len = this.anim.layers.length - 1; i < len; i++) {
			const layer = this.anim.layers[i];
			if (layer.isInFrame(this.anim.currentFrame)) {
				/* this is repeated in ui layer */
				const props = layer.getCloneProps();
				props.startFrame = this.anim.currentFrame + 1;
				this.anim.addLayer(new Layer(props));
				layer.endFrame = this.anim.currentFrame;
			}
		}
		this.ui.panels.playback.setFrame(this.anim.currentFrame + 1);
	}

	// select all layers in frame
	select(isSelect=true, isAll) {
		for (let i = 0, len = this.anim.layers.length - 1; i < len; i++) {
			const layer = this.anim.layers[i];
			if (!layer.isInFrame(this.anim.currentFrame) && !isAll) continue;
			
			if (layer.isToggled !== isSelect) {
				if (layer.groupNumber >= 0) {
					this.timelineRow[`group-${layer.groupNumber}`].toggle.update(isSelect);
				} else {
					this.timelineRow[`layer-${i}`].toggle.update(isSelect);
				}
			}
		}
	}

	lock(isLock=true) {
		for (let i = 0, len = this.anim.layers.length - 1; i < len; i++) {
			const layer = this.anim.layers[i];
			if (layer.isInFrame(this.anim.currentFrame) && layer.isLocked !== isLock) {
				this.timelineRow[`layer-${i}`].lock.update(isLock);
			}
		}
	}

	layersToEnd() {
		for (let i = 0, len = this.anim.layers.length; i < len; i++) {
			if (this.anim.layers[i].isInFrame(this.anim.currentFrame)) {
				this.anim.layers[i].endFrame = this.anim.endFrame;
			}
		}
		this.update();
	}

	resetLayers() {
		for (let i = 0, len = this.anim.layers.length; i < len; i++) {
			const layer = this.anim.layers[i];
			layer.reset();
		}
		this.drawLayers();
	}
}