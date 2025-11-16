import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

// Ensure this route runs in a Node runtime (required by @google-cloud/storage)
export const runtime = 'nodejs';

/**
 * POST /api/doc-upload
 * Expects multipart/form-data with one or more file fields named `files`.
 * This is a skeleton: you must install `@google-cloud/storage` and configure
 * authentication (see notes below).
 *
 * Environment / setup notes:
 * - Install dependency: `npm install @google-cloud/storage`
 * - Configure authentication: set `GOOGLE_APPLICATION_CREDENTIALS` env var pointing to
 *   a service account JSON key, or ensure the runtime has appropriate ADC permissions.
 * - Set `GCS_BUCKET` env var to the target bucket name.
 */
export async function POST(request) {
  try {
    const formData = await request.formData();

    // formData.getAll('files') will return an array of Web File objects
    const files = formData.getAll('files');
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const bucketName = process.env.GCS_BUCKET;
    if (!bucketName) {
      return NextResponse.json({ error: 'Server not configured: GCS_BUCKET missing' }, { status: 500 });
    }

    // Initialize GCS client. Authentication is handled by Application Default Credentials
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);

    const uploaded = [];

    for (const file of files) {
      // `file` is a Web File object (has .name, .type and arrayBuffer() )
      const filename = file.name || `upload-${Date.now()}`;
      const contentType = file.type || 'application/octet-stream';
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const gfile = bucket.file(filename);

      // Save buffer to GCS. For larger files you may want to use a resumable upload stream.
      await gfile.save(buffer, {
        metadata: { contentType },
        resumable: false,
      });

      uploaded.push({ filename, url: `gs://${bucketName}/${filename}` });
    }

    return NextResponse.json({ status: 'ok', uploaded }, { status: 200 });
  } catch (err) {
    // Log the error server-side if desired
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
