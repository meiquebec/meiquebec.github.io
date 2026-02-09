(window.CarteMEI = {

	secrets: null,
	comites: null,
	parent: null,
	ccmap: null,
	map: null,
	


	init: async function() {
		if(await documentReady(() => this.initParent())) {
			await Promise.all([
				this.loadSecrets(),
				this.loadComites()
			]);
			console.log(this.secrets);
			console.log(this.comites);
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
		this.ccmap = this.parent.create('div', 'carte-mei__map');

		tag.replaceWith(this.parent);
		return true;
	},


	loadSecrets: async function() {
		this.secrets = await SECRETS;
	},


	loadComites: async function() {
		await loadJsonProperties(this, { comites: atob('L2NvbWl0ZXMuanNvbg==') });
	},


	initMap: async function() {
		const { ColorScheme, ControlPosition, LatLngBounds } = await google.maps.importLibrary('core');
        const { Map, Data } = await google.maps.importLibrary('maps');
		this.map = new Map(this.ccmap, {
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: false,
            cameraControl: false,
            disableDoubleClickZoom: true,
			colorScheme: ColorScheme.LIGHT,

			center: { lat: 45.5017, lng: -73.5673 }, // Montreal coordinates
			zoom: 12, // Zoom level (0-20+)
	
			styles: [
				{ elementType: "geometry", stylers: [{ color: cssVar("--map-bg") }] },
				{ elementType: "labels.text.fill", stylers: [{ color: cssVar("--map-fg") }] },
				{ elementType: "labels.text.stroke", stylers: [{ color: cssVar("--map-bg") }] },
				{ featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: cssVar("--map-fg") }, { weight: 0.6 }, { lightness: 40 }] },
				{ featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: cssVar("--map-blue") }] },
				{ featureType: "water", elementType: "geometry", stylers: [{ color: cssVar("--map-water") }] },
				{ featureType: "water", elementType: "labels.text.fill", stylers: [{ color: cssVar("--map-water") }] },
				{ featureType: "landscape", elementType: "geometry", stylers: [{ color: cssVar("--map-ground") }] },
				{ featureType: "poi.park", elementType: "geometry", stylers: [{ color: cssVar("--map-green") }] },
				{ featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: cssVar("--map-fg") }] },
				{ featureType: "poi", stylers: [{ visibility: "simplified" }] },
				{ featureType: "poi.business", stylers: [{ visibility: "off" }] },
				{ featureType: "road", elementType: "geometry", stylers: [{ color: cssVar("--map-road") }] },
				{ featureType: "road", elementType: "geometry.stroke", stylers: [{ color: cssVar("--map-fg") }, { weight: 0.5 }, { lightness: 55 }] },
				{ featureType: "road", elementType: "labels.text.fill", stylers: [{ color: cssVar("--map-fg") }] },
				{ featureType: "road.highway", elementType: "geometry", stylers: [{ color: cssVar("--map-highway") }] },
				{ featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: cssVar("--map-red") }, { weight: 1.1 }] },
				{ featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: cssVar("--map-red") }] },
				{ featureType: "transit", elementType: "geometry", stylers: [{ color: cssVar("--map-road") }] },
				{ featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: cssVar("--map-blue") }] }
			]
        });
	},

}).init();