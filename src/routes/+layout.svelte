<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/Navbar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link
		href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<Navbar />

{@render children()}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #f7f7f7;
		height: 100%;
	}
</style>
