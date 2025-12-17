import type { RequestEvent } from '@sveltejs/kit';
import { writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

function getTargetDir(type: string) {
    return path.join(process.cwd(), 'data', type);
}

export async function load() {
    const targetDir = getTargetDir('markers');

    try {
        const files = await readdir(targetDir);
        const fileNames = files.filter(file => !file.startsWith('.'));

        return {
            files: fileNames
        };
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            return { files: [] };
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

            const targetDir = getTargetDir('markers');
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
