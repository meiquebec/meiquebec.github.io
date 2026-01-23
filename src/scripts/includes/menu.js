window.Menu = {


	burger: null,

	init: async function() {
		// console.log("patate");
		this.burger = document.querySelector('.burger');
		this.burger.addEventListener('click', () => this.toggleBurger());
	},

	toggleBurger: async function() {
		this.burger.classList.toggle('open');
	}

}


document.addEventListener('DOMContentLoaded', e => Menu.init());