window.Menu = {


	burger: null,

	init: async function() {
		// console.log("patate");
		this.burger = document.querySelector('.burger');
		this.burger.addEventListener('click', () => this.toggleBurger());

		document.querySelectorAll('.menu a').forEach(elm => {
			elm.addEventListener('click', () => {
				this.burger.classList.remove('open');
			});
		});
	},

	toggleBurger: async function() {
		this.burger.classList.toggle('open');
	}

}


document.addEventListener('DOMContentLoaded', e => Menu.init());