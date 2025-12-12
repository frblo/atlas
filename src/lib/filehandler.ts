import fs from 'fs';

const markers = "./data/markers";
const maps = "./data/maps";
const configs = "./data/maps";

enum FileType {
	Marker, Map, Config
}

function setup() {
	create_dir("./data");
	create_dir(markers);
	create_dir(maps);
	create_dir(configs);
}

function create_dir(dir: string) {
	if (!fs.existsSync(dir)) {
		fs.mkdir(dir, (err) => {
			if (err) { console.error(err) }
		});
	}
}

function upload_file() { }
