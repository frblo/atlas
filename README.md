# Atlas

Atlas is a world building tool for creating interactive maps. It allows for loading in maps (as images) and then placing (moving and deleting) custom markers with writable text fields for world builders to create interactive maps of their worlds.

Atlas runs without a database and/or user authentication. All files and data are saved locally.

## Running

> [!WARNING]
> Atlas is only meant to be run on private networks. Atlas currently has vulnerabilities and little to no security measures. **Do not run** this on publically available networks.

### Docker

The recommended way to run Atlas is via Docker. Simply run

```sh
docker-compose --file docker-compose.yml up
```

to launch Atlas. This will create a volume called `atlas-data` where all files will be stored.

### npm

Atlas can also be launched via npm by running

```sh
npm i
npm run dev -- --open
```

which can be easier to use during development. This also allows for easier control over the `data` directory.

## Features

- Interactive maps
    - Uploading and using maps of (pretty much) any image variety
    - Interactive panning and zooming
- Custom markers
    - Pretty much any image variety
- Placing, moving and removing markers on maps
    - Writable popup text fields on every marker with html support
