export const runtime = 'nodejs';

import { Storage } from '@google-cloud/storage';

const storage = new Storage();

/**
 * GET /api/documents
 * Returns a JSON list of files in the configured GCS bucket.
 * Environment variable required: GCS_BUCKET
 */
export async function GET(req) {
  try {
    const bucketName = process.env.GCS_BUCKET;
    if (!bucketName) {
      return new Response(JSON.stringify({ error: 'GCS_BUCKET not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const bucket = storage.bucket(bucketName);
    // Get files; getFiles returns File instances. We'll fetch metadata for each file.
    const [files] = await bucket.getFiles();

    const filesMeta = await Promise.all(
      files.map(async (file) => {
        try {
          const [meta] = await file.getMetadata();
          return {
            name: meta.name,
            size: meta.size ? Number(meta.size) : null,
            contentType: meta.contentType || null,
            updated: meta.updated || null,
            mediaLink: meta.mediaLink || null
          };
        } catch (err) {
          return { name: file.name || '<unknown>', error: 'metadata_unavailable' };
        }
      })
    );

    return new Response(JSON.stringify({ files: filesMeta }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Error listing documents:', err);
    return new Response(JSON.stringify({ error: 'failed_to_list_documents' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
