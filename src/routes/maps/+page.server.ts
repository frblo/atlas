import { fail, type RequestEvent } from '@sveltejs/kit';
import { deleteFile, listFiles, saveUploadedFile } from '$lib/filepage-server';

const TYPE = 'maps';

export async function load() {
    return {
        files: await listFiles(TYPE)
    };
}

export const actions = {
    upload: async ({ request }: RequestEvent) => {
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
    },

    delete: async ({ request }: RequestEvent) => {
        const formData = await request.formData();
        const fileName = formData.get('fileName') as string;

        if (!fileName) {
            return fail(400, { missing: true });
        }

        try {
            await deleteFile(TYPE, fileName);
            await deleteFile("configs", fileName + ".json");

            return { success: true };
        } catch (err) {
            console.error(err);
            return fail(500, { error: 'Failed to delete file' });
        }
    }
};
