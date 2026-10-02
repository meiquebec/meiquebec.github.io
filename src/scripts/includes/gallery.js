import Modal from './modal';
import Swiper from 'swiper';
import { Autoplay, Navigation } from 'swiper/modules';


({
	SPACE_REM: 1,
	SLIDE_NUM: 3,
	SLIDE_DELAY: 3000,

	swipers: null,
	modal: null,

	mutexSwiper: null,
	mutexRem: null,


	// Les galeries arrivent déjà dans le HTML (plugin {% galerie %}) :
	// <div class="galerie"><a class="galerie__carte" href="grande"><img src="vignette"></a>…</div>
	init: async function() {

		await documentReady();
		const galeries = [...document.querySelectorAll('.galerie')];
		if(!galeries.length) return;

		this.modal = new Modal;
		this.swipers = await Promise.all(galeries.map(async elm => this.createGallery(elm)));
		
		await new Promise(requestAnimationFrame);
		this.swipers.forEach(swiper => {
			swiper.params.spaceBetween = Number(Math.round(rem(this.SPACE_REM) + 'e+2') + 'e-2');
			swiper.update();
			swiper.updateSize();
			swiper.updateSlides();
		});

		window.addEventListener('resize', () => {
			if (this.mutexSwiper != null) return;
			const mutexRem = Number(Math.round(rem(this.SPACE_REM) + 'e+2') + 'e-2');
			this.mutexSwiper = requestAnimationFrame(() => {
				this.swipers.forEach(swiper => {
					if(mutexRem != swiper.params.spaceBetween) {
						swiper.params.spaceBetween = mutexRem;
						swiper.update();
					}
				});
				this.mutexSwiper = null;
			});
		});

	},


	createGallery: async function(elm) {
		const parent = create('div', 'gallery');
		const prev = parent.create('div', 'gallery-prev', 'a');
		const content = parent.create('div', 'gallery-content');
		const next = parent.create('div', 'gallery-next', 'a');
		const container = content.create('div', 'swiper gallery-swiper')
		const wrapper = container.create('div', 'swiper-wrapper');
		const slidenum = this.SLIDE_NUM;
		const delay = this.SLIDE_DELAY;

		// Chaque lien du balisage devient une diapositive ; son href est la grande image.
		const cards = [...elm.querySelectorAll('.galerie__carte')].map(card => {
			card.classList.add('swiper-slide', 'gallery-card');
			card.addEventListener('click', async evt => {
				evt.preventDefault();
				const src = card.href;
				working(new Promise(async res => {
					await preloadImage(src);
					await this.modal.show(create('img', 'gallery-image', null, { src }));
					res();
				}));
			});
			return card;
		});

		wrapper.append(...cards);
		elm.replaceWith(parent);
		return new Promise(resolve => {
			const swiper = new Swiper(container, {
				modules: [Autoplay, Navigation],
				slidesPerView: slidenum,
				spaceBetween: rem(this.SPACE_REM),
				allowTouchMove: true,
				autoHeight: true,
				preloadImages: false,
				observer: false,
				observeParents: false,
				observeSlideChildren: false,
				updateOnWindowResize: false,
				preventClicks: true,
				preventClicksPropagation: true,
				lazy: { loadPrevNext: true, loadOnTransitionStart: true },
				autoplay: { delay: delay, disableOnInteraction: false },
				navigation: { nextEl: next, prevEl: prev },
				// on: { init: function () { this.update(); }},
			});

			resolve(swiper);
		});
	},

}).init();