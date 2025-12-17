import type { RequestEvent } from '@sveltejs/kit';
import { listFiles, saveUploadedFile } from '$lib/filepage-server';

const TYPE = 'markers';

export async function load() {
    return {
        files: await listFiles(TYPE)
    };
}

export const actions = {
    default: async ({ request }: RequestEvent) => {
        const formData = await request.formData();
        const uploadedFile = formData.get('file') as File;

        if (!uploadedFile) {
            return { success: false, error: 'No file uploaded' };
        }

        try {
            await saveUploadedFile(TYPE, uploadedFile);
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false };
        }
    }
};
