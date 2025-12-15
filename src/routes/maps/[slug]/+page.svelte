<script lang="ts">
	export let data;
	import LeafletMap from '$lib/LeafletMap.svelte';
</script>

<svelte:head>
	<title>{data.slug} - Atlas</title>
</svelte:head>

<LeafletMap MAP_URL={data.slug} />
