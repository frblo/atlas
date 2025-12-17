import { writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';

function getTargetDir(type: string) {
	return path.join(process.cwd(), 'data', type);
}

export async function listFiles(type: string) {
	const targetDir = getTargetDir(type);

	try {
		const files = await readdir(targetDir);
		return files.filter((file) => !file.startsWith('.'));
	} catch (err: any) {
		if (err.code === 'ENOENT') {
			return [];
		}
		throw err;
	}
}

export async function saveUploadedFile(
	type: string,
	file: File
) {
	const targetDir = getTargetDir(type);
	const filename = path.join(targetDir, file.name);

	await mkdir(targetDir, { recursive: true });
	await writeFile(filename, Buffer.from(await file.arrayBuffer()));
}

export async function deleteFile(type: string, fileName: string) {
	const targetDir = getTargetDir(type);
	const filename = path.join(targetDir, fileName);

	try {
		await unlink(filename);


		return true;
	} catch (err: any) {
		if (err.code === 'ENOENT') {
			return false;
		}
		throw err;
	}
}
