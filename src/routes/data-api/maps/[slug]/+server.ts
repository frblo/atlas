import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mime from 'mime-types';
import type { RequestHandler } from './$types';

const BASE_DIR = path.join(process.cwd(), 'data', 'maps');

export const GET: RequestHandler = async ({ params }) => {
    const filePath = path.join(BASE_DIR, params.slug);

    try {
        const file = await readFile(filePath);
        const contentType = mime.lookup(filePath);

        return new Response(file, {
            headers: {
                'Content-Type': contentType || 'application/octet-stream',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch {
        return new Response('Not found', { status: 404 });
    }
};
