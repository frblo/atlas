<script lang="ts">
	import type { LatLngBoundsExpression, Map } from 'leaflet';
	import { onMount, onDestroy } from 'svelte';
	import 'leaflet/dist/leaflet.css';

	let mapElement: HTMLElement;
	let map: Map;

	const createPopupContent = (L: any, layer: any, text: string, isEditMode: boolean) => {
		const container = L.DomUtil.create('div');

		// Stop clicks inside this container from closing the popup
		L.DomEvent.disableClickPropagation(container);
		L.DomEvent.disableScrollPropagation(container);

		if (isEditMode) {
			const textarea = L.DomUtil.create('textarea', '', container);
			textarea.style.width = '200px';
			textarea.style.height = '100px';
			textarea.style.marginBottom = '5px';
			textarea.style.fontFamily = 'inherit';
			textarea.value = text;
			textarea.placeholder = 'Placeholder...';

			// Focus the cursor automatically
			setTimeout(() => {
				textarea.focus();
			}, 50);

			const btnContainer = L.DomUtil.create('div', '', container);
			const saveBtn = L.DomUtil.create('button', '', btnContainer);
			saveBtn.innerHTML = 'Save';
			saveBtn.style.marginRight = '5px';

			L.DomEvent.on(saveBtn, 'click', (e: any) => {
				L.DomEvent.stop(e);
				const newText = textarea.value;
				(layer as any)._customText = newText;
				layer.setPopupContent(createPopupContent(L, layer, newText, false));
			});

			const cancelBtn = L.DomUtil.create('button', '', btnContainer);
			cancelBtn.innerHTML = 'Cancel';
			cancelBtn.style.marginRight = '5px';

			L.DomEvent.on(cancelBtn, 'click', (e: any) => {
				L.DomEvent.stop(e);
				const oldText = (layer as any)._customText || '';
				layer.setPopupContent(createPopupContent(L, layer, oldText, false));
			});

			const deleteBtn = L.DomUtil.create('button', '', btnContainer);
			deleteBtn.innerHTML = 'Delete';

			L.DomEvent.on(deleteBtn, 'click', (e: any) => {
				L.DomEvent.stop(e);
				if (layer) {
					map.removeLayer(layer);
				}
			});
		} else {
			const textDiv = L.DomUtil.create('div', '', container);
			textDiv.style.whiteSpace = 'pre-wrap';
			textDiv.style.minWidth = '150px';
			textDiv.innerHTML = text || '(No text)';

			const editBtn = L.DomUtil.create('button', '', container);
			editBtn.innerHTML = 'Edit';
			editBtn.style.marginTop = '10px';
			editBtn.style.fontSize = '12px';

			L.DomEvent.on(editBtn, 'click', (e: any) => {
				L.DomEvent.stop(e);
				layer.setPopupContent(createPopupContent(L, layer, text, true));
			});
		}

		return container;
	};

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

		const myCustomIcon = L.icon({
			iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg',
			iconSize: [30, 30],
			iconAnchor: [15, 15],
			popupAnchor: [0, -15]
		});

		map.on('editable:drawing:commit', (e: any) => {
			const layer = e.layer;
			const content = createPopupContent(L, layer, '', true);
			layer.bindPopup(content).openPopup();
		});

		const EditControl = (L.Control as any).extend({
			options: { position: 'topleft', callback: null, kind: '', html: '', toolOptions: null },
			onAdd: function (map: Map) {
				const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
				const link = L.DomUtil.create('a', '', container);
				link.href = '#';
				link.title = this.options.kind;
				link.innerHTML = this.options.html;
				link.style.display = 'flex';
				link.style.alignItems = 'center';
				link.style.justifyContent = 'center';
				link.style.fontSize = '14px';
				L.DomEvent.on(link, 'click', L.DomEvent.stop).on(
					link,
					'click',
					function (this: any) {
						this.options.callback.call((map as any).editTools, null, this.options.toolOptions);
					},
					this
				);
				return container;
			}
		});

		const addControl = (
			kind: string,
			html: string,
			callbackName: string,
			extraOptions: any = {}
		) => {
			const ControlClass = EditControl.extend({
				options: {
					kind,
					html,
					callback: (map as any).editTools[callbackName],
					toolOptions: extraOptions
				}
			});
			map.addControl(new ControlClass());
		};

		addControl('marker', '🖈', 'startMarker');
		addControl('circle', '⬤', 'startCircle');
		addControl(
			'marker2',
			'<img src="https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg" style="width:12px">',
			'startMarker',
			{ icon: myCustomIcon }
		);
	});

	onDestroy(async () => {
		if (map) {
			map.remove();
		}
	});
</script>

<main>
	<div bind:this={mapElement}></div>
</main>

<style>
	main div {
		height: 800px;
		width: 100%;
		background-color: #eee;
	}

	:global(.leaflet-bar a) {
		text-decoration: none;
		cursor: pointer;
		color: black;
	}

	:global(.leaflet-popup-content textarea) {
		resize: vertical;
		padding: 5px;
		border: 1px solid #ccc;
	}
</style>
