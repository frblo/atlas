<script lang="ts">
	export let data;
	export let form;
	export let type;
	export let linkedCard;
	const lowerType = type.toLowerCase();
</script>

<svelte:head>
	<title>{type}s - Atlas</title>
</svelte:head>

<main>
	<section class="upload-section">
		<h1>Upload {lowerType}</h1>

		<form method="POST" enctype="multipart/form-data" class="upload-form">
			<input type="file" name="file" required class="file-input" />
			<button type="submit" class="upload-btn">Upload {lowerType}</button>
		</form>

		{#if form?.success}
			<div class="alert success">Upload successful!</div>
		{/if}
	</section>

	<hr />

	<section class="gallery-section">
		<h2>Available {lowerType}s</h2>

		{#if data.files.length === 0}
			<p class="empty-state">No {lowerType}s uploaded yet.</p>
		{:else}
			<div class="item-grid">
				{#each data.files as fileName}
					<svelte:element
						this={linkedCard ? 'a' : 'div'}
						href={linkedCard ? `/${lowerType}s/${fileName}` : undefined}
						class="item-card"
					>
						<div class="image-wrapper">
							<img
								src={`/data/${lowerType}s/${fileName}`}
								alt="{type} of {fileName}"
								loading="lazy"
							/>
						</div>

						<div class="card-content">
							<p>{fileName}</p>
						</div>
					</svelte:element>
				{/each}
			</div>
		{/if}
	</section>
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
		font-family: 'Noto Sans', sans-serif;
		color: #333;
	}

	h1,
	h2 {
		font-family: 'Merriweather', serif;
		margin-bottom: 1rem;
	}

	hr {
		border: 0;
		border-top: 1px solid #e0e0e0;
		margin: 2rem 0;
	}

	.upload-section {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.upload-form {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.file-input {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.upload-btn {
		background-color: #0077cc;
		color: white;
		border: none;
		padding: 0.6rem 1.2rem;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		transition: background-color 0.2s;
	}

	.upload-btn:hover {
		background-color: #005fa3;
	}

	.alert.success {
		margin-top: 1rem;
		padding: 0.75rem;
		background-color: #d4edda;
		color: #155724;
		border-radius: 4px;
		border: 1px solid #c3e6cb;
	}

	.item-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.item-card {
		display: flex;
		flex-direction: column;
		background: white;
		border-radius: 8px;
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		border: 1px solid #eaeaea;
	}

	.item-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
	}

	.image-wrapper {
		width: 100%;
		height: 200px;
		background-color: #eee;
		overflow: hidden;
	}

	.item-card img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.item-card:hover img {
		transform: scale(1.05);
	}

	.card-content {
		padding: 1rem;
	}

	.card-content p {
		margin: 0;
		font-weight: 600;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.empty-state {
		color: #666;
		font-style: italic;
	}
</style>
