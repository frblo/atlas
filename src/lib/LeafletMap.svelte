<script lang="ts">
	import type { LatLngBoundsExpression, Map } from 'leaflet';
	import { onMount, onDestroy } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import { browser } from '$app/environment';
	import DEFAULT_MARKER from '$lib/assets/default_marker.svg';

	let mapElement: HTMLElement;
	let map: Map;

	export let MAP_URL: string;
	let ABSOLUTE_MAP_URL = '/data/maps/' + MAP_URL;

	let currentMarkerIconUrl: string = DEFAULT_MARKER;
	let currentMarkerIcon: any = null;

	function customIcon(L: any, iconUrl: string) {
		return L.icon({
			iconUrl: iconUrl,
			iconSize: [30, 30],
			iconAnchor: [15, 15],
			popupAnchor: [0, -15]
		});
	}

	const setCurrentIcon = (L: any, iconUrl: string) => {
		currentMarkerIconUrl = iconUrl;
		currentMarkerIcon = customIcon(L, iconUrl);
	};

	const getMapBounds = (url: string): Promise<{ width: number; height: number }> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
			img.onerror = (err) => reject(err);
			img.src = url;
		});
	};

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
				unsavedChanges = true;
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

	let unsavedChanges = false;
	const handleBeforeUnload = (e: BeforeUnloadEvent) => {
		if (unsavedChanges) {
			e.preventDefault();
		}
	};

	onMount(async () => {
		const L = await import('leaflet');
		await import('leaflet-editable');

		const { width, height } = await getMapBounds(ABSOLUTE_MAP_URL);

		const bounds: LatLngBoundsExpression = [
			[0, 0],
			[height / 10, width / 10] // Not dividing by 10 makes the max zoomout small
		];

		map = L.map(mapElement, {
			editable: true,
			crs: L.CRS.Simple
		});

		L.imageOverlay(ABSOLUTE_MAP_URL, bounds).addTo(map);

		map.fitBounds(bounds);

		// Export map to JSON
		const saveConfig = async () => {
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
					if (layer.options.icon) {
						geoJson.properties.iconUrl = layer.options.icon.options.iconUrl;
					}
				}

				features.push(geoJson);
			});

			const featureCollection = {
				type: 'FeatureCollection',
				features: features
			};

			const fileName = MAP_URL + '.json';
			const response = await fetch('/data/configs/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					filename: fileName,
					content: featureCollection
				})
			});

			if (response.ok) {
				console.log(`Saved ${fileName} successfully!`);
				unsavedChanges = false;
			} else {
				const errText = await response.text();
				console.error(errText);
				alert('Failed to save.');
			}
		};

		// Import from JSON
		const loadConfig = async () => {
			const response = await fetch('/data/configs/' + MAP_URL + '.json');
			if (!response.ok) return;
			const config = await response.json();

			L.geoJSON(config, {
				pointToLayer: (feature, latlng) => {
					if (feature.properties.type === 'circle') {
						return L.circle(latlng, { radius: feature.properties.radius });
					} else {
						let options = {};
						if (feature.properties.iconUrl) {
							const iconUrl = feature.properties.iconUrl;
							options = { icon: customIcon(L, iconUrl) };
						}
						return L.marker(latlng, options);
					}
				},
				onEachFeature: (feature, layer: any) => {
					const text = feature.properties.text || '';
					layer.popupText = text;

					const content = createPopupContent(L, layer, text, false);
					layer.bindPopup(content);

					layer.addTo((map as any).editTools.featuresLayer);
					layer.enableEdit();
				}
			});
		};

		await loadConfig();

		map.on('editable:drawing:commit', (e: any) => {
			const layer = e.layer;
			const content = createPopupContent(L, layer, '', true);
			layer.bindPopup(content).openPopup();
			unsavedChanges = true;
		});

		map.on('editable:dragend', () => {
			unsavedChanges = true;
		});

		map.on('editable:vertex:dragend', () => {
			unsavedChanges = true;
		});

		setCurrentIcon(L, DEFAULT_MARKER);

		// Setup toolbar
		const EditControl = (L.Control as any).extend({
			options: { position: 'topleft', callback: null, kind: '', html: '', toolOptions: null },
			onAdd: function (map: Map) {
				const container = L.DomUtil.create(
					'div',
					'leaflet-control leaflet-bar leaflet-control-' + this.options.kind
				);

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

		const startSelectedMarker = () => {
			(map as any).editTools.startMarker(null, { icon: currentMarkerIcon });
		};

		addControl(
			'marker-selected',
			'<img src="' + currentMarkerIconUrl + '" style="width:12px">',
			startSelectedMarker
		);

		let markers: string[] = [];
		try {
			const markerResponse = await fetch('/data/markers/all');
			const markerData = await markerResponse.json();
			markers = markerData.markers;
		} catch (error) {
			console.error('Error fetching markers:', error);
		}

		const MarkerSelectorControl = (L.Control as any).extend({
			options: { position: 'topleft' },
			onAdd: function () {
				const container = L.DomUtil.create(
					'div',
					'leaflet-control leaflet-bar marker-selector-control'
				);

				const mainButton = L.DomUtil.create('a', 'marker-selector-button', container);
				mainButton.href = '#';
				mainButton.innerHTML =
					'<img id="current-marker-icon" alt="Selected Marker" src="' +
					DEFAULT_MARKER +
					'" style="width:12px">';
				L.DomEvent.on(mainButton, 'click', L.DomEvent.stop);

				const menu = L.DomUtil.create('div', 'marker-selector-menu', container);

				L.DomEvent.disableScrollPropagation(menu);
				L.DomEvent.disableClickPropagation(menu);

				const setMarkerClickHandle = (url: string, item: HTMLAnchorElement) => {
					L.DomEvent.on(item, 'click', L.DomEvent.stop).on(item, 'click', () => {
						setCurrentIcon(L, url);
						(document.getElementById('current-marker-icon') as HTMLImageElement).src = url;
						(
							document.querySelector('.leaflet-control-marker-selected a img') as HTMLImageElement
						).src = url;
					});
				};

				markers.forEach((filename) => {
					const iconUrl = '/data/markers/' + filename;
					const item = L.DomUtil.create('a', 'marker-menu-item', menu);
					item.href = '#';
					item.innerHTML = `<img alt="${filename}" src="${iconUrl}" style="width:20px; height: 20px;">`;
					item.title = filename;

					setMarkerClickHandle(iconUrl, item);
				});

				const defaultItem = L.DomUtil.create('a', 'marker-menu-item', menu);
				defaultItem.href = '#';
				defaultItem.innerHTML = `<img alt="Default marker" src="${DEFAULT_MARKER}" style="width:20px; height: 20px;">`;
				defaultItem.title = 'Default marker';

				setMarkerClickHandle(DEFAULT_MARKER, defaultItem);
				return container;
			}
		});

		map.addControl(new MarkerSelectorControl());
		addControl('circle', '⬤', 'startCircle');
		addControl('save', '💾', saveConfig);

		window.addEventListener('beforeunload', handleBeforeUnload);
	});

	onDestroy(() => {
		if (browser) {
			// To handle SPA routing
			window.removeEventListener('beforeunload', handleBeforeUnload);
		}
		if (map) map.remove();
	});
</script>

<main>
	<div bind:this={mapElement}></div>
</main>

<style>
	/* Map component */
	main div {
		height: calc(100vh - 85px); /* Dirty trick. 85px is navbar height */
		width: 100%;
		background-color: #f7f7f7;
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
	/* Marker selector main button */
	:global(.marker-selector-control) {
		position: relative;
		z-index: 1000;
		width: 30px;
		height: 30px;
		padding: 0;
		margin-bottom: 5px;
	}
	/* The currently selected marker button */
	:global(.marker-selector-button) {
		width: 30px;
		height: 30px;
		line-height: 30px;
		text-align: center;
		border-radius: 4px;
		background-color: white;
		border: 2px solid rgba(0, 0, 0, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	/* Hidden marker selection menu */
	:global(.marker-selector-menu) {
		display: none;
		position: absolute;
		top: 30px;
		left: 0;
		width: 200px;
		max-height: 200px;
		overflow-y: auto;
		background-color: white;
		border: 2px solid rgba(0, 0, 0, 0.2);
		border-top: none;
		box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4);
		padding: 5px;
		box-sizing: border-box;
	}
	:global(.marker-selector-control:hover .marker-selector-menu),
		/* On hover marker selection menu */
	:global(.marker-selector-menu:hover) {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
	:global(.marker-menu-item) {
		flex: 0 0 calc(25% - 5px);
		display: block;
		padding: 5px;
		border: 1px solid transparent;
		border-radius: 3px;
		text-align: center;
	}
	:global(.marker-menu-item:hover) {
		background-color: #f4f4f4;
		border-color: #ccc;
	}
</style>
