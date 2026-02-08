import Swiper from 'swiper';
import { Autoplay, Navigation } from 'swiper/modules';
import Modal from './modal';


({
	SPACE_REM: 1,
	SLIDE_NUM: 3,
	SLIDE_DELAY: 3000,

	galleries: null,
	swipers: null,
	modal: null,

	mutexSwiper: null,
	mutexRem: null,


	init: async function() {
		await Promise.all([
			documentReady(),
			loadJsonProperties(this, { galleries: atob('L2dhbGxlcmllcy5qc29u') })
		]);

		this.modal = new Modal;

		this.swipers = await Promise.all([...document.querySelectorAll('gallery')].map(async elm => {
			const id = elm.getAttribute('id');
			if(!id) return;
			const gallery = this.galleries.find(g => g.name == id);
			if(!gallery) return;
			return this.createGallery(elm, gallery);
		}));

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
		requestAnimationFrame(() => {
			this.swipers.forEach(swiper => {
				swiper.params.spaceBetween = Number(Math.round(rem(this.SPACE_REM) + 'e+2') + 'e-2');
				swiper.update();
				swiper.updateSize();
				swiper.updateSlides();
			});
		});
	
	},


	createGallery: async function(elm, gallery) {
		const parent = create('div', 'gallery');
		const prev = parent.create('div', 'gallery-prev', 'a');;
		const content = parent.create('div', 'gallery-content');
		const next = parent.create('div', 'gallery-next', 'a');

		const container = content.create('div', 'swiper gallery-swiper')
		const wrapper = container.create('div', 'swiper-wrapper');

		const slidenum = elm.getAttribute('slidenum') ?? this.SLIDE_NUM;
		const delay = elm.getAttribute('delay') ?? this.SLIDE_DELAY;

		gallery.files.map(async img => {
			const card = wrapper.create('div', 'swiper-slide gallery-card');
			card.style.setProperty('--image', `url(${img.tbn})`);
			card.addEventListener('click', async () => {
				await working(new Promise(async res => {
					await preloadImage(img.src);
					await this.modal.show(create('img', 'gallery-image', null, { src: img.src }));
					res();
				}));
			});
			preloadImage(img.tbn);
		});

		elm.replaceWith(parent);
		return new Promise(resolve => {
			const swiper = new Swiper(container, {
				modules: [Autoplay, Navigation],
				slidesPerView: slidenum,
				spaceBetween: rem(this.SPACE_REM),
				allowTouchMove: true,
				autoHeight: false,
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
			on: { init: function () { this.update(); }},
			});

			resolve(swiper);
		});
		
	},

}).init();