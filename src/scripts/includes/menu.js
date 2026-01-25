window.Menu = {
	
	burger: null,

	init: async function() {
		this.burger = document.querySelector('.burger');
		this.burger.addEventListener('click', () => this.toggleBurger());
		document.addEventListener('click', () => this.burger.classList.remove('open'), true);
	},

	toggleBurger: async function() {
		this.burger.classList.toggle('open');
	}

}


document.addEventListener('DOMContentLoaded', e => Menu.init());