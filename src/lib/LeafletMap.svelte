<script lang="ts">
	import type { LatLngBoundsExpression, Map } from 'leaflet';
	import { onMount, onDestroy } from 'svelte';
	import 'leaflet/dist/leaflet.css';

	let mapElement: HTMLElement;
	let map: Map;

	const RED_DOT_URL = 'https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg';

	// Manage the marker popup content
	const createPopupContent = (L: any, layer: any, text: string, isEditMode: boolean) => {
		const container = L.DomUtil.create('div');
		L.DomEvent.disableClickPropagation(container);
		L.DomEvent.disableScrollPropagation(container);

		if (isEditMode) {
			const textarea = L.DomUtil.create('textarea', '', container);
			textarea.style.width = '200px';
			textarea.style.height = '100px';
			textarea.style.marginBottom = '5px';
			textarea.value = text;

			setTimeout(() => textarea.focus(), 50);

			const btnContainer = L.DomUtil.create('div', '', container);

			// Save logic
			const saveBtn = L.DomUtil.create('button', '', btnContainer);
			saveBtn.innerHTML = 'Save';
			saveBtn.style.marginRight = '5px';
			L.DomEvent.on(saveBtn, 'click', (e: any) => {
				L.DomEvent.stop(e);
				const newText = textarea.value;
				(layer as any).popupText = newText;
				layer.setPopupContent(createPopupContent(L, layer, newText, false));
			});

			// Cancel logic
			const cancelBtn = L.DomUtil.create('button', '', btnContainer);
			cancelBtn.innerHTML = 'Cancel';
			cancelBtn.style.marginRight = '5px';
			L.DomEvent.on(cancelBtn, 'click', (e: any) => {
				L.DomEvent.stop(e);
				const oldText = (layer as any).popupText || '';
				layer.setPopupContent(createPopupContent(L, layer, oldText, false));
			});

			// Delete logic
			const deleteBtn = L.DomUtil.create('button', '', btnContainer);
			deleteBtn.innerHTML = 'Delete';
			L.DomEvent.on(deleteBtn, 'click', (e: any) => {
				L.DomEvent.stop(e);
				(map as any).editTools.featuresLayer.removeLayer(layer);
			});
		} else {
			const textDiv = L.DomUtil.create('div', '', container);
			textDiv.style.whiteSpace = 'pre-wrap';
			textDiv.style.minWidth = '150px';
			textDiv.innerHTML = text || '(No text)';

			const editBtn = L.DomUtil.create('button', '', container);
			editBtn.innerHTML = 'Edit';
			editBtn.style.marginTop = '10px';
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
		}).setView([300, 378], 0);

		L.imageOverlay(
			'https://upload.wikimedia.org/wikipedia/commons/b/bb/Mayor_of_London_constituency_results_2000.svg',
			bounds
		).addTo(map);

		map.fitBounds(bounds);

		const myCustomIcon = L.icon({
			iconUrl: RED_DOT_URL,
			iconSize: [30, 30],
			iconAnchor: [15, 15],
			popupAnchor: [0, -15]
		});

		// Export map to JSON
		const saveToDatabase = async () => {
			const features: any[] = [];

			(map as any).editTools.featuresLayer.eachLayer((layer: any) => {
				const geoJson = layer.toGeoJSON();

				geoJson.properties = geoJson.properties || {};
				geoJson.properties.text = layer.popupText || '';

				if (layer instanceof L.Circle) {
					geoJson.properties.type = 'circle';
					geoJson.properties.radius = layer.getRadius();
				} else if (layer instanceof L.Marker) {
					geoJson.properties.type = 'marker';
					// Check if using the custom icon
					if (layer.options.icon && layer.options.icon.options.iconUrl === RED_DOT_URL) {
						geoJson.properties.isCustomIcon = true;
					}
				}

				features.push(geoJson);
			});

			const featureCollection = {
				type: 'FeatureCollection',
				features: features
			};

			console.log('Saving to server:', JSON.stringify(featureCollection));
		};

		// Import from JSON
		const loadFromDatabase = async () => {
			// Temporary local storage
			const raw = localStorage.getItem('geojson-demo-data');
			if (!raw) return;
			const data = JSON.parse(raw);

			L.geoJSON(data, {
				pointToLayer: (feature, latlng) => {
					if (feature.properties.type === 'circle') {
						return L.circle(latlng, { radius: feature.properties.radius });
					} else {
						const options = feature.properties.isCustomIcon ? { icon: myCustomIcon } : {};
						return L.marker(latlng, options);
					}
				},
				onEachFeature: (feature, layer: any) => {
					const text = feature.properties.text || '';
					layer.popupText = text;

					const content = createPopupContent(L, layer, text, false);
					layer.bindPopup(content);

					layer.addTo((map as any).editTools.featuresLayer);
				}
			});
		};

		map.on('editable:drawing:commit', (e: any) => {
			const layer = e.layer;
			const content = createPopupContent(L, layer, '', true);
			layer.bindPopup(content).openPopup();
		});

		// Setup toolbar
		const EditControl = (L.Control as any).extend({
			options: { position: 'topleft', callback: null, kind: '', html: '', toolOptions: null },
			onAdd: function (map: Map) {
				const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
				const link = L.DomUtil.create('a', '', container);
				link.href = '#';
				link.innerHTML = this.options.html;
				link.style.display = 'flex';
				link.style.alignItems = 'center';
				link.style.justifyContent = 'center';
				L.DomEvent.on(link, 'click', L.DomEvent.stop).on(
					link,
					'click',
					function (this: any) {
						if (this.options.callback)
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
			callbackOrName: string | Function,
			extraOptions: any = {}
		) => {
			let callback;
			if (typeof callbackOrName === 'string') {
				callback = (map as any).editTools[callbackOrName];
			} else {
				callback = callbackOrName;
			}
			const ControlClass = EditControl.extend({
				options: { kind, html, callback, toolOptions: extraOptions }
			});
			map.addControl(new ControlClass());
		};

		addControl('marker', '🖈', 'startMarker');
		addControl('circle', '⬤', 'startCircle');
		addControl('marker2', '<img src="' + RED_DOT_URL + '" style="width:12px">', 'startMarker', {
			icon: myCustomIcon
		});

		addControl('save', '💾', saveToDatabase);
	});

	onDestroy(() => {
		if (map) map.remove();
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
		width: 30px;
		height: 30px;
		font-size: 14px;
	}
	:global(.leaflet-popup-content textarea) {
		resize: vertical;
		padding: 5px;
		border: 1px solid #ccc;
	}
</style>
