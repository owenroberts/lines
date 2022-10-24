/*
	add randomized tweens
	anim needs to be longer than 1 frame
*/
function AnimatorUI() {

	let panel;
	let animator;

	function addUI() {
		for (const param in animator.params) {

			const row1 = panel.addRow();
			const range = animator.params[param];

			panel.add(new UILabel({
				text: param
			}), row1);

			const row2 = panel.addRow();
			panel.add(new UINumber({
				text: "Min",
				value: range[0],
				callback: function(n) {
					range[0] = +n;
				}
			}), row2, 'min');

			panel.add(new UINumber({
				text: "Max",
				value: range[1],
				callback: function(n) {
					range[1] = +n;
				}
			}), row2, 'max');
		}
	}

	function add() {
		animator = new Animator(lns.anim);
		lns.anim.onPlayedState = () => {
			animator.update();
		};
		addUI();
	}

	function remove() {
		animator = undefined;
		lns.anim.onPlayedState = undefined;
		for (let i = panel.rows.length - 1; i > 0; i--) {
			panel.rows[i].clear();
			panel.removeRow(panel.rows[i]);
		}
	}

	function connect() {
		panel = lns.ui.getPanel('animator');

		lns.ui.addCallbacks([
			{ callback: add, text: 'Add' },
			{ callback: remove, text: 'Remove' },
		]);
	}

	return { connect };

}