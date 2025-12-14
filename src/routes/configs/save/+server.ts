// API route to be able to save configs on the server
import { json, type RequestEvent } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

const getTargetDir = () => path.join(process.cwd(), 'data', 'configs');

export async function POST({ request }: RequestEvent) {
    try {
        const targetDir = getTargetDir();
        await fs.mkdir(targetDir, { recursive: true });

        const { filename, content } = await request.json();

        if (!filename || !content) {
            return json({ success: false, error: 'Missing filename or content' }, { status: 400 });
        }

        const filePath = path.join(targetDir, filename);

        await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');

        console.log(`Saved config to: ${filePath}`);
        return json({ success: true, message: 'File saved successfully' });

    } catch (error) {
        console.error('Error saving file:', error);
        return json({ success: false, error: 'Failed to save file' }, { status: 500 });
    }
}
