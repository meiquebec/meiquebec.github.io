window.Menu = {

	burger: null,
	maxscroll: -1,
	scrollpos: -1,


	init: async function() {
		this.burger = document.querySelector('.burger');
		this.burger.addEventListener('click', () => this.toggleBurger());
		document.addEventListener('click', (e) => this.closeBurger(e), true);
		document.addEventListener('scroll', () => this.setScrollY(), { passive: true });
		window.addEventListener('resize', () => this.setPaddingTop(), { passive: true });
		this.setPaddingTop();
	},


	toggleBurger: async function() {
		this.burger.classList.toggle('open');
	},


	closeBurger: async function(e) {
		if(!e.target.classList.contains('burger')) {
			this.burger.classList.remove('open')
		}
	},


	setScrollY: async function() {
 		let pos = window.scrollY || document.documentElement.scrollTop;
		if(pos > this.maxscroll) pos = this.maxscroll;
		if(pos < 0) pos = 0;
		const perc = pos / this.maxscroll;
		if(perc != this.scrollpos) {
			this.scrollpos = perc;
			await new Promise(requestAnimationFrame);
			document.documentElement.style.setProperty('--scroll-pos', String(this.scrollpos));
		}
	},


	setPaddingTop: async function() {
		const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
		if(padding != this.maxscroll) {
			this.maxscroll = padding;
			this.setScrollY();
		}
	}

}


document.addEventListener('DOMContentLoaded', e => Menu.init());