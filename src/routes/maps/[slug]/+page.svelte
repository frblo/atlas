<script lang="ts">
	export let data;
	import LeafletMap from '$lib/LeafletMap.svelte';
</script>

<main>
	<h1>{data.slug}</h1>
	<LeafletMap MAP_URL="../../../../data/maps/{data.slug}" />
</main>
