<svelte:head>
	<title>Atlas</title>
	<link
		href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<main>
	<img src="/src/lib/assets/favicon.svg" height="300" alt="Logo" />
	<h1>Atlas</h1>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		margin: 0;
		padding: 1em;
		text-align: center;
		/* background-color: #f7f7f7; */
	}

	img {
		margin-bottom: 20px;
		max-width: 100%;
	}

	h1 {
		font-family: 'Merriweather', serif;
		font-weight: 700;
		font-size: 4em;
		color: #333;
		letter-spacing: 0.1em;
		margin-top: 0;
		text-transform: uppercase;
	}
</style>
