<script lang="ts">
	export let data;
	export let form;
</script>

<h1>Upload map</h1>

<form method="POST" enctype="multipart/form-data">
	<input type="file" name="file" required />
	<button type="submit">Upload Map</button>
</form>

{#if form?.success}
	<p style="color: green;">Upload successful!</p>
{/if}

<hr />

<h2>Available Maps</h2>

{#if data.maps.length === 0}
	<p>No maps uploaded yet.</p>
{:else}
	<ul>
		{#each data.maps as mapName}
			<a href="/maps/{mapName}">
				<img src="/data/maps/{mapName}" width="10%" alt="Map" />
				<p>{mapName}</p>
			</a>
		{/each}
	</ul>
{/if}
