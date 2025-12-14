// API route get all marker URLs
import { json } from '@sveltejs/kit';
import { readdir } from 'fs/promises';
import path from 'path';

const getTargetDir = () => path.join(process.cwd(), 'data', 'markers');

export async function GET() {
    try {
        const targetDir = getTargetDir();

        const files = await readdir(targetDir);
        const markerFiles = files.filter(file => !file.startsWith('.'));

        return json({ markers: markerFiles });
    } catch (error) {
        console.error('Failed to get files:', error);
        return json({ error: 'Failed to get files' }, { status: 500 });
    }
}
