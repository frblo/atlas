<script lang="ts">
	import type { LatLngBoundsExpression, Map } from 'leaflet';
	import { onMount, onDestroy } from 'svelte';
	import 'leaflet/dist/leaflet.css';

	let mapElement: HTMLElement;
	let map: Map;

	onMount(async () => {
		const L = await import('leaflet');
		await import('leaflet-editable');

		const bounds: LatLngBoundsExpression = [
			[0, 0],
			[607, 756]
		];

		map = L.map(mapElement, {
			editable: true,
			crs: L.CRS.Simple
		} as any).setView([300, 378], 0);

		L.imageOverlay(
			'https://upload.wikimedia.org/wikipedia/commons/b/bb/Mayor_of_London_constituency_results_2000.svg',
			bounds
		).addTo(map);

		map.fitBounds(bounds);

		const EditControl = (L.Control as any).extend({
			options: {
				position: 'topleft',
				callback: null,
				kind: '',
				html: ''
			},

			onAdd: function (map: Map) {
				const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
				const link = L.DomUtil.create('a', '', container);

				link.href = '#';
				link.title = 'Create a new ' + this.options.kind;
				link.innerHTML = this.options.html;

				link.style.display = 'flex';
				link.style.alignItems = 'center';
				link.style.justifyContent = 'center';
				link.style.fontSize = '14px';

				L.DomEvent.on(link, 'click', L.DomEvent.stop).on(
					link,
					'click',
					function (this: any) {
						this.options.callback.call((map as any).editTools);
					},
					this
				);

				return container;
			}
		});

		const addControl = (kind: string, html: string, callbackName: string) => {
			const ControlClass = EditControl.extend({
				options: {
					kind: kind,
					html: html,
					callback: (map as any).editTools[callbackName]
				}
			});
			map.addControl(new ControlClass());
		};

		addControl('marker', '🖈', 'startMarker');
		addControl('circle', '⬤', 'startCircle');
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
		height: 500px;
		width: 100%;
	}

	:global(.leaflet-bar a) {
		text-decoration: none;
		cursor: pointer;
		color: black;
	}
</style>
