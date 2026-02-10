// import CSSDoc from "./cssdoc";

(window.CarteMEI = {

	secrets: null,
	comites: null,
	parent: null,
	ccmap: null,
	map: null,
	// info: null,
	

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
		this.parent.create('div', null, '<svg width="0" height="0" style="position:absolute; left:-9999px; top:-9999px" aria-hidden="true"><defs><clipPath id="clip-marker-pin" clipPathUnits="objectBoundingBox"><path d="M 0.5 0 C 0.776143 0 1 0.156694 1 0.35 C 1 0.665639 0.5 1 0.5 1 C 0.5 1 0 0.668444 0 0.35 C 0 0.156694 0.223857 0 0.5 0 Z"/></clipPath></defs></svg>');
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
		const { Map, Data } = await google.maps.importLibrary('maps');
		// const css = new CSSDoc;
		// this.info = new google.maps.InfoWindow();

		this.map = new Map(this.ccmap, {
            mapId: this.secrets.MAP_ID,
			streetViewControl: false,
            mapTypeControl: false,
            zoomControl: false,
            cameraControl: false,
            disableDoubleClickZoom: true,
			colorScheme: ColorScheme.LIGHT,

			center: { lat: 45.5017, lng: -73.5673 },
			zoom: 12
	
        });


		this.comites.filter(e => e.active).map(async item => {
			const el = create('div', 'mei-marker');
			el.addEventListener("click", (ev) => {
				ev.stopPropagation();
				console.log("click via DOM content");
			});
			
			const marker = new AdvancedMarkerElement({
				map: this.map,
				position: { lat: item.location.lat, lng: item.location.lng },
				content: el,
				title: item.name,
			});


		});


	},

}).init();