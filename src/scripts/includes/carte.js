// Décode data-config de <carte-mei> : base64 de OBF::encode() côté PHP
// (JSON → base64 → ROT13 → gzip sans ses deux octets d'en-tête).
async function decoderConfig(b64) {
	const octets = new Uint8Array([0x1f, 0x8b, ...Uint8Array.from(atob(b64), c => c.charCodeAt(0))]);
	const texte = await new Response(new Blob([octets]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
	return JSON.parse(atob(texte.replace(/[A-Za-z]/g, c => {
		const base = c <= 'Z' ? 65 : 97;
		return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
	})));
}


(window.CarteMEI = {

	config: null,
	comites: null,
	parent: null,
	ccmap: null,
	map: null,
	markers: null,
	info: null,


	init: async function() {
		if(await documentReady(() => this.initParent())) {
			loadScript('https://maps.googleapis.com/maps/api/js', {
				key:       this.config.cle,
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
		this.config = await decoderConfig(tag.dataset.config);
		this.comites = JSON.parse(tag.dataset.comites || '[]');
		this.parent = create('div', 'carte-mei');
		this.ccmap = this.parent.create('div', 'carte-mei__map', null, { id: "carte-mei" });
		this.parent.create('div', 'carte-mei__markermask', '<svg width="0" height="0" style="position:absolute; left:-9999px; top:-9999px" aria-hidden="true"><defs><clipPath id="clip-marker-pin" clipPathUnits="objectBoundingBox"><path d="M 0.5 0 C 0.776143 0 1 0.156694 1 0.35 C 1 0.665639 0.5 1 0.5 1 C 0.5 1 0 0.668444 0 0.35 C 0 0.156694 0.223857 0 0.5 0 Z"/></clipPath></defs></svg>');
		tag.replaceWith(this.parent);
		return true;
	},


	initMap: async function() {
		const { ColorScheme, ControlPosition } = await google.maps.importLibrary('core');
		const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
		const { Map } = await google.maps.importLibrary('maps');

		this.map = new Map(this.ccmap, {
            mapId: this.config.mapid,
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

		// Seuls les comités actifs placés sur la carte sont dans data-comites.
		this.markers = await Promise.all(this.comites.map(async item => this.createMarker(item, AdvancedMarkerElement)));
	},


	createMarker: function(item, AME) {
		const marker = create('div', 'mei-marker');
		marker.addEventListener("click", e => {
			e.stopPropagation();
			this.map.setZoom(Math.max(this.map.getZoom(), 13));
			this.map.panTo(item.position);
			this.info.show(item);
		});
		return new AME({
			map: this.map,
			position: item.position,
			content: marker,
			title: item.nom,
		});
	},


	centerMap: async function() {
		const { LatLngBounds } = await google.maps.importLibrary('core');
		const bounds = new LatLngBounds();
		this.comites.forEach(c => bounds.extend(c.position));
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
		// item.logo : URL relative à la page, générée par IMG::asset() au rendu.
		const elm = create('div', 'mapinfo__content');
		if(item.logo) elm.create('img', null, null, { src: item.logo, alt: '' });
		elm.create('div', null, `${item.nom}<br><a target="_blank" rel="noopener noreferrer" href="${item.instagram}">Suivre sur Instagram</a>`);
		if(item.logo) await preloadImage(item.logo).catch(() => {});
		this.elm.replaceChildren(elm);
		this.elm.classList.add('show');
		this.reset();
	}

}