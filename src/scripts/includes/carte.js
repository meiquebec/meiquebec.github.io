import CSSDoc from "./cssdoc";

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
		const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
		const { Map, Data } = await google.maps.importLibrary('maps');
		const css = new CSSDoc;







		this.map = new Map(this.ccmap, {
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: false,
            cameraControl: false,
            disableDoubleClickZoom: true,
			colorScheme: ColorScheme.LIGHT,

			center: { lat: 45.5017, lng: -73.5673 }, // Montreal coordinates
			zoom: 12, // Zoom level (0-20+)
			mapId: '7a4f282a9b2f394eb458f2ee',
	
			// styles: [
			// 	{ elementType: "geometry", stylers: [{ color: css("--map-bg") }] },
			// 	{ elementType: "labels.text.fill", stylers: [{ color: css("--map-fg") }] },
			// 	{ elementType: "labels.text.stroke", stylers: [{ color: css("--map-bg") }] },
			// 	{ featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: css("--map-fg") }, { weight: 0.6 }, { lightness: 40 }] },
			// 	{ featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: css("--map-blue") }] },
			// 	{ featureType: "water", elementType: "geometry", stylers: [{ color: css("--map-water") }] },
			// 	{ featureType: "water", elementType: "labels.text.fill", stylers: [{ color: css("--map-water") }] },
			// 	{ featureType: "landscape", elementType: "geometry", stylers: [{ color: css("--map-ground") }] },
			// 	{ featureType: "poi.park", elementType: "geometry", stylers: [{ color: css("--map-green") }] },
			// 	{ featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: css("--map-fg") }] },
			// 	{ featureType: "poi", stylers: [{ visibility: "simplified" }] },
			// 	{ featureType: "poi.business", stylers: [{ visibility: "off" }] },
			// 	{ featureType: "road", elementType: "geometry", stylers: [{ color: css("--map-road") }] },
			// 	{ featureType: "road", elementType: "geometry.stroke", stylers: [{ color: css("--map-fg") }, { weight: 0.5 }, { lightness: 55 }] },
			// 	{ featureType: "road", elementType: "labels.text.fill", stylers: [{ color: css("--map-fg") }] },
			// 	{ featureType: "road.highway", elementType: "geometry", stylers: [{ color: css("--map-highway") }] },
			// 	{ featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: css("--map-red") }, { weight: 1.1 }] },
			// 	{ featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: css("--map-red") }] },
			// 	{ featureType: "transit", elementType: "geometry", stylers: [{ color: css("--map-road") }] },
			// 	{ featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: css("--map-blue") }] }
			// ]
        });


		this.comites.filter(e => e.active).forEach(item => {
			const el = document.createElement("div");
			el.textContent = "📍";
			el.style.fontSize = "22px";

			const adv2 = new AdvancedMarkerElement({
				map: this.map,
				position: { lat: item.location.lat, lng: item.location.lng },
				content: el,
				title: item.name,
			});

// const marker = new google.maps.Marker({
//   position: { lat: item.location.lat, lng: item.location.lng },
//   map: this.map,
//   title: "Montréal",
// });

		});


	},

}).init();