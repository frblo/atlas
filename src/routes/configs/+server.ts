// API route to be able to save configs on the server
import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export async function POST({ request }: any) {
    try {
        const { filename, content } = await request.json();

        if (!filename || !content) {
            return json({ success: false, error: 'Missing filename or content' }, { status: 400 });
        }

        const safeFilename = path.basename(filename);
        const filePath = path.resolve(`data/configs/${safeFilename}`);

        await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');

        console.log(`Saved config to: ${filePath}`);
        return json({ success: true, message: 'File saved successfully' });

    } catch (error) {
        console.error('Error saving file:', error);
        return json({ success: false, error: 'Failed to save file' }, { status: 500 });
    }
}
