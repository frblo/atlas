<script lang="ts">
	import type { LatLngBoundsExpression, Map } from 'leaflet';
	import { onMount, onDestroy } from 'svelte';

	let mapElement: HTMLElement;
	var map: Map;

	onMount(async () => {
		const leaflet = await import('leaflet');

		map = leaflet.map(mapElement, { crs: leaflet.CRS.Simple }).setView([51.505, -0.09], 13);

		const bounds: LatLngBoundsExpression = [
			[0, 0],
			[607, 756]
		];
		leaflet
			.imageOverlay(
				'https://upload.wikimedia.org/wikipedia/commons/b/bb/Mayor_of_London_constituency_results_2000.svg',
				bounds
			)
			.addTo(map);
		map.fitBounds(bounds);
		leaflet
			.marker([51.5, -0.09])
			.addTo(map)
			.bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
			.openPopup();
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
