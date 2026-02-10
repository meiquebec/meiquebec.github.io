export default class CSSDoc extends Function {

	elm = null;
	computed = null;

	constructor(elm = null) {
		super("name", "return this.__call__(name)");
		this.elm = elm || document.documentElement;
		this.computed = getComputedStyle(this.elm);
		return this.bind(this);
	}

	__call__(name) {
		return this.computed.getPropertyValue(name).trim();
	}

}