import type { RequestEvent } from '@sveltejs/kit';
import { writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const getTargetDir = () => path.join(process.cwd(), 'data', 'maps');

export async function load() {
    const targetDir = getTargetDir();

    try {
        const files = await readdir(targetDir);
        const mapFiles = files.filter(file => !file.startsWith('.'));

        return {
            maps: mapFiles
        };
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            return { maps: [] };
        }
        throw err;
    }
}

export const actions = {
    default: async ({ request }: RequestEvent) => {
        try {
            const formData = await request.formData();
            const uploadedFile = formData?.get('file') as File;

            if (!uploadedFile) {
                return { success: false, error: 'No file uploaded' };
            }

            const targetDir = getTargetDir();
            const filename = path.join(targetDir, uploadedFile.name);

            await mkdir(targetDir, { recursive: true });
            await writeFile(filename, Buffer.from(await uploadedFile.arrayBuffer()));

            return { success: true };
        } catch (error) {
            console.error('Error saving file:', error);
            return { success: false };
        }
    }
};
