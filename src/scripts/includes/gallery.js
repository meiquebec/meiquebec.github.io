import Swiper from 'swiper';
import { Autoplay, Navigation } from 'swiper/modules';


({

	galleries: null,

	init: async function() {
		await Promise.all([
			documentReady(),
			loadJsonProperties(this, { galleries: atob('L2dhbGxlcmllcy5qc29u') })
		]);
		await Promise.all([...document.querySelectorAll('gallery')].map(async elm => {
			const id = elm.getAttribute('id');
			if(!id) return;
			const gallery = this.galleries.find(g => g.name == id);
			if(!gallery) return;
			return this.createGallery(elm, gallery);
		}));
	},


	createGallery: async function(elm, gallery) {
		const container = create('div', 'swiper gallery-swiper')
		const wrapper = container.create('div', 'swiper-wrapper');

		const preloads = gallery.files.map(async img => {
			const card = wrapper.create('div', 'swiper-slide gallery-card');
			card.style.setProperty('--image', `url(${img.tbn})`);
			return preloadImage(img.tbn);
		});

		elm.replaceWith(container);
		return new Promise(resolve => {
			resolve(new Swiper(container, {
				modules: [Autoplay],
				slidesPerView: 3,
				spaceBetween: rem(1),
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
				autoplay: { delay: 5000, disableOnInteraction: false },
				// navigation: { nextEl: '.events-swiper-next', prevEl: '.events-swiper-prev' },
			}));
		});
		
	},

}).init();