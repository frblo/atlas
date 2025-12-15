<script lang="ts">
	export let data;
	import LeafletMap from '$lib/LeafletMap.svelte';
</script>

<head>
	<title>{data.slug} - Atlas</title>
</head>

<main>
	<h1>{data.slug}</h1>
	<LeafletMap MAP_URL={data.slug} />
</main>
