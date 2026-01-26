window.Menu = {

	burger: null,

	init: async function() {
		this.burger = document.querySelector('.burger');
		this.burger.addEventListener('click', () => this.toggleBurger());
		document.addEventListener('click', (e) => this.closeBurger(e), true);
	},

	toggleBurger: async function() {
		this.burger.classList.toggle('open');
	},

	closeBurger: async function(e) {
		if(!e.target.classList.contains('burger')) {
			this.burger.classList.remove('open')
		}
	}

}


document.addEventListener('DOMContentLoaded', e => Menu.init());