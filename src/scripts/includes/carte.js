(window.CarteMEI = {

	secrets: null,
	comites: null,
	parent: null,
	ccmap: null,
	map: null,
	markers: null,
	info: null,
	

	init: async function() {
		if(await documentReady(() => this.initParent())) {
			await Promise.all([
				this.loadSecrets(),
				this.loadComites()
			]);
			loadScript('https://maps.googleapis.com/maps/api/js', {
				key:       this.secrets.GOOGLE_API_KEY,
				callback:  'CarteMEI.initMap',
				libraries: 'geometry',
				loading:   'async',
				language:  'fr',
				region:    'CA',
				v:         'weekly',
			}, true);
		}
	},


	initParent: async function() {
		const tag = document.querySelector('carte-mei');
		if(!tag) return false;
		this.parent = create('div', 'carte-mei');
		this.ccmap = this.parent.create('div', 'carte-mei__map', null, { id: "carte-mei" });
		this.parent.create('div', 'carte-mei__markermask', '<svg width="0" height="0" style="position:absolute; left:-9999px; top:-9999px" aria-hidden="true"><defs><clipPath id="clip-marker-pin" clipPathUnits="objectBoundingBox"><path d="M 0.5 0 C 0.776143 0 1 0.156694 1 0.35 C 1 0.665639 0.5 1 0.5 1 C 0.5 1 0 0.668444 0 0.35 C 0 0.156694 0.223857 0 0.5 0 Z"/></clipPath></defs></svg>');
		tag.replaceWith(this.parent);
		return true;
	},


	loadSecrets: async function() {
		this.secrets = await SECRETS;
	},


	loadComites: async function() {
		await loadJsonProperties(this, { comites: atob('L2RhdGEvY29taXRlcy5qc29u') });
	},


	initMap: async function() {
		const { ColorScheme, ControlPosition, LatLngBounds } = await google.maps.importLibrary('core');
		const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
		const { Map } = await google.maps.importLibrary('maps');

		this.map = new Map(this.ccmap, {
            mapId: this.secrets.MAP_ID,
			streetViewControl: false,
            mapTypeControl: false,
            zoomControl: false,
            cameraControl: false,
            disableDoubleClickZoom: true,
			colorScheme: ColorScheme.LIGHT
        });

		this.info = new MapInfo(this.parent);
		this.map.controls[ControlPosition.TOP_LEFT].push(this.info.elm);

		const center = create('div', 'mei-center', null, { title: "Centrer la carte" });
		center.addEventListener('click', () => this.centerMap());
		this.map.controls[ControlPosition.BOTTOM_RIGHT].push(center);
		this.centerMap();

		this.markers = await Promise.all(this.comites.filter(e => e.active).map(async item => {
			const marker = create('div', 'mei-marker');
			marker.addEventListener("click", e => {
				e.stopPropagation();
				this.map.setZoom(Math.max(this.map.getZoom(), 10))
				this.map.panTo({ lat: item.location.lat, lng: item.location.lng });
				this.info.show(item);
				
			});
			return new AdvancedMarkerElement({
				map: this.map,
				position: { lat: item.location.lat, lng: item.location.lng },
				content: marker,
				title: item.name,
			});
		}));
	},


	centerMap: async function() {
		const { LatLngBounds } = await google.maps.importLibrary('core');
		const bounds = new LatLngBounds();
		this.comites.filter(e => e.active).forEach(c => bounds.extend({ lat: c.location.lat, lng: c.location.lng }));
		this.map.fitBounds(bounds, 48);
	}

}).init();



class MapInfo {

	elm = null;
	timeout = null;
	duration = 5000;
	
	constructor() {
		this.elm = create('div', 'mapinfo');
		this.elm.addEventListener('mouseover', () => this.reset());
		this.elm.addEventListener('mouseout', () => this.reset());
	}


	reset() {
		if(this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			if(this.elm.matches(':hover')) return setTimeout(() => this.reset(), 0);
			this.elm.classList.remove('show');
			this.timeout = null;
		}, this.duration);
	}


	async show(item) {
		const img = `/images/comites/${item.id}.webp`;
		const elm = create('div', 'mapinfo__content');
		elm.create('img', null, null, { src: img });
		elm.create('div', null, `${item.name}<br><a target="_blank" href="${item.instagram}">Suivre sur Instagram</a>`);
		await preloadImage(img);
		this.elm.replaceChildren(elm);
		this.elm.classList.add('show');
		this.reset();
	}

}