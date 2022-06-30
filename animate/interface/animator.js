/*
	add randomized tweens
	anim needs to be longer than 1 frame
*/
function AnimatorInterface() {
	const self = this;

	let animator;

	function addUI() {
		for (const param in animator.params) {

			const row1 = self.panel.addRow();
			const range = animator.params[param];

			self.panel.add(new UILabel({
				text: param
			}), row1);

			const row2 = self.panel.addRow();
			self.panel.add(new UINumber({
				text: "Min",
				value: range[0],
				callback: function(n) {
					range[0] = +n;
				}
			}), row2, 'min');

			self.panel.add(new UINumber({
				text: "Max",
				value: range[1],
				callback: function(n) {
					range[1] = +n;
				}
			}), row2, 'max');
		}
	}

	this.add = function() {
		animator = new Animator(lns.anim);
		lns.anim.onPlayedState = function() {
			animator.update();
		};
		addUI();
	};

	this.remove = function() {
		animator = undefined;
		lns.anim.onPlayedState = undefined;
		for (let i = self.panel.rows.length - 1; i > 0; i--) {
			self.panel.rows[i].clear();
			self.panel.removeRow(self.panel.rows[i]);
		}
	};

}