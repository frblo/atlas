<script lang="ts">
	export let data;
	export let form;
</script>

<head>
	<title>Markers - Atlas</title>
</head>

<h1>Upload marker</h1>

<form method="POST" enctype="multipart/form-data">
	<input type="file" name="file" required accept="image/*" />
	<button type="submit">Upload marker</button>
</form>

{#if form?.success}
	<p style="color: green;">Upload successful!</p>
{/if}

<hr />

<h2>Available markers</h2>

{#if data.markers.length === 0}
	<p>No markers uploaded yet.</p>
{:else}
	<ul>
		{#each data.markers as markerName}
			<img src="/data/markers/{markerName}" width="10%" alt="Marker: {markerName}" />
			<p>{markerName}</p>
		{/each}
	</ul>
{/if}
{#if form?.error}
	<p style="color: red;">{form.error}</p>
{/if}
