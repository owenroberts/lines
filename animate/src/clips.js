import { UIPanel, UILabel, UIButton, UINumberStep, UISelect, UIModal, UIToggleCheck, UIText } from '../../../oi/src/oi.js';

/**
 * animation clips, subset of frames 
 * rename clips?
 */
export class ClipsPanel extends UIPanel {
	constructor(ui, anim) {
		super({ id: 'clips', ui });
		this.setStyle("max-width", "360px");

		this.anim = anim;

		this.addButtons(
			{ obj: this },
			[
				{ callback: () => { this.set('default'); }, key: 'shift-t', text: 'default' },
				{ ref: "create", key: 'alt-t', text: "+" },
			]
		);
	}

	update() {
		for (const name of this.anim.clips.names) {
			const clip = this.anim.clips[name];
			const component = this.children[`${name}-clip`] ?? this.addUI(name, clip, false);
			for (const k in clip) {
				if (k === "name") continue; // maybe add later ... 
				component.children[k].value = clip[k];
			}
		}
	}

	addUI(name, clip, focus) {

		const row = this.addRow({ id: `${name}-clip`, class: "break" });
		// this.anim.clips[name] = clip;
		this.ui.faces.clipSelect.addOption(name);

		if (name !== "default") {

			row.add(new UIText({
				value: name,
				class: "left-label",
				callback: value => {
					console.log(value, name, this.anim.clips.names)
					const clip = this.anim.clips[name];
					this.anim.clips.add(value, clip);
					this.anim.clips.remove(name);
					console.log(value, name, this.anim.clips.names)
				}
			}));

			row.add(new UIButton({
				text: "x",
				callback: () => {
					delete this.anim.clips[name];
					this.removeRow(row);
					this.anim.clips.set("default");
					this.ui.faces.clipSelect.value = 'default';
					this.ui.faces.clipSelect.removeOption(name);
					this.ui.update();
				}
			}));
		} else {
			this.add(new UILabel({ text: name }), "name");
		}

		row.add(new UIButton({
			text: '⊙',
			callback: () => { this.set(name); }
		}));

		row.add(new UINumberStep({
			obj: clip,
			ref: "start",
			callback: () => { this.ui.update(); },
		}), 'start');

		row.add(new UINumberStep({
			obj: clip,
			ref: "end",
			callback: () => { this.ui.update(); },
		}), 'end');

		row.addLabel('↹');

		row.add(new UISelect({
			value: clip.dir ?? 1,
			options: [-1, 1],
			callback: value => { 
				clip.dir = +value;
				this.ui.update(); 
			}
		}), 'dir');

		row.add(new UILabel({ text: '↻' }));

		row.add(new UIToggleCheck({
			obj: clip,
			ref: "loop",
		}), 'loop');

		return row;
	}

	set(clipName) {
		if (clipName) {
			this.anim.clips.set(clipName);
			this.ui.faces.clipSelect.value = clipName;
			if (clipName === "default") {
				this.anim.currentFrame = this.anim.clips.current.start;
			}
			this.ui.update();
			return;
		}

		const m = new UIModal({
			ui: this.ui,
			title: "select clip",
		});

		for (const name of this.anim.clips.names) {
			m.add(new UIButton({
				text: name,
				callback: () => {
					this.anim.clips.set(name);
					this.ui.faces.clipSelect.value = name;
					m.clear();
					this.ui.update();
				}
			}));
		}
	}

	create() {
		const name = prompt('name?');
		if (!name) return;
		const clip = {
			start: this.anim.currentFrame, 
			end: this.anim.currentFrame,
			dir: 1,
			loop: true,
		};
		this.anim.clips.add(name, clip);
		this.anim.clips.set(name);
		this.ui.faces.clipSelect.value = name;
		this.ui.update();
	}
}