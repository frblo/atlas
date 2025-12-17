<script lang="ts">
	export let data;
	export let form;
	const type = 'Map';
	import FilePage from '$lib/FilePage.svelte';
</script>

<FilePage {data} {form} {type} />
