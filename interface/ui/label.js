class UILabel extends UIElement {
	constructor(params) {
		params.tag = "label";
		super(params);
		this.setTextContent(params.text);
	}
}