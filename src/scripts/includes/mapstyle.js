import CSSDoc from "./cssdoc";


self.downloadMapStyle = () => {

	const css = new CSSDoc;
	const styles = {
		variant: "light",
		backgroundColor: css('--map-bg'),
		styles: [
			{
				id: "infrastructure.railwayTrack",
				geometry: {
					fillOpacity: 0.6,
					fillColor: css('--map-road')
				}
			},
			{
				id: "infrastructure.roadNetwork.road",
				geometry: {
					fillColor: css('--map-road'),
					strokeOpacity: 0.22,
					strokeColor: css('--map-fg'),
					strokeWidth: 1
				},
				label: {
					textFillOpacity: 0.85,
					textFillColor: css('--map-fg'),
					textStrokeOpacity: 0.25,
					textStrokeColor: css('--map-bg')
				}
			},
			{
				id: "infrastructure.roadNetwork.road.highway",
				geometry: {
					fillColor: css('--map-highway'),
					strokeOpacity: 0.34,
					strokeColor: css('--map-red'),
					strokeWidth: 1
				},
				label: {
					textFillOpacity: 0.89,
					textFillColor: css('--map-red'),
					textStrokeOpacity: 0.25,
					textStrokeColor: css('--map-bg')
				}
			},
			{
				id: "infrastructure.roadNetwork.road.local",
				label: {
					visible: false
				}
			},
			{
				id: "infrastructure.roadNetwork.roadDetail",
				geometry: {
					visible: false
				}
			},
			{
				id: "infrastructure.roadNetwork.roadShield",
				label: {
					visible: false
				}
			},
			{
				id: "infrastructure.roadNetwork.roadSign",
				label: {
					visible: false
				}
			},
			{
				id: "infrastructure.transitStation",
				label: {
					textFillOpacity: 0.89,
					textFillColor: css('--map-blue'),
					textStrokeOpacity: 0.25,
					textStrokeColor: css('--map-bg')
				}
			},
			{
				id: "infrastructure.urbanArea",
				geometry: {
					fillOpacity: 1,
					fillColor: css('--map-ground')
				}
			},
			{
				id: "natural.base",
				geometry: {
					fillColor: css('--map-ground')
				}
			},
			{
				id: "natural.land",
				geometry: {
					fillColor: css('--map-ground')
				}
			},
			{
				id: "natural.water",
				geometry: {
					fillColor: css('--map-water')
				},
				label: {
					textFillOpacity: 1,
					textFillColor: css('--map-water'),
					textStrokeOpacity: 0.34,
					textStrokeColor: css('--map-bg')
				}
			},
			{
				id: "pointOfInterest",
				label: {
					visible: false
				}
			},
			{
				id: "pointOfInterest.recreation.park",
				geometry: {
					fillColor: css('--map-green')
				},
				label: {
					visible: true,
					textFillOpacity: 0.89,
					textFillColor: css('--map-fg'),
					textStrokeOpacity: 0.30,
					textStrokeColor: css('--map-bg')
				}
			},
			{
				id: "political",
				label: {
					textFillOpacity: 0.89,
					textFillColor: css('--map-fg'),
					textStrokeOpacity: 0.34,
					textStrokeColor: css('--map-bg')
				}
			},
			{
				id: "political.city",
				label: {
					textFillOpacity: 0.94,
					textFillColor: css('--map-blue'),
					textStrokeOpacity: 0.34,
					textStrokeColor: css('--map-bg')
				}
			},
			{
				id: "political.neighborhood",
				label: {
					visible: false
				}
			}
		]
	};

	downloadJsonObject(styles, 'carte-style-mei.json');
}