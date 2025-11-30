<script lang="ts">
	import { Control, FeatureGroup, type Map } from 'leaflet';
	import 'leaflet-draw';
	import { onMount, onDestroy } from 'svelte';

	var mapElement;
	var map: Map;

	onMount(async () => {
		const leaflet = await import('leaflet');

		map = leaflet.map(mapElement).setView([51.505, -0.09], 13);

		leaflet
			.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			})
			.addTo(map);
		// FeatureGroup is to store editable layers
		var drawnItems = new FeatureGroup();
		map.addLayer(drawnItems);
		var drawControl = new Control.Draw({
			edit: {
				featureGroup: drawnItems
			}
		});
		map.addControl(drawControl);

		// leaflet
		// 	.marker([51.5, -0.09])
		// 	.addTo(map)
		// 	.bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
		// 	.openPopup();
	});

	onDestroy(async () => {
		if (map) {
			console.log('Unloading Leaflet map.');
			map.remove();
		}
	});
</script>

<main>
	<div bind:this={mapElement}></div>
</main>

<style>
	main div {
		height: 400px;
	}
</style>
