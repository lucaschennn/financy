import { Storage } from '@google-cloud/storage';
import { Firestore } from '@google-cloud/firestore';
import pdfParse from 'pdf-parse';

const storage = new Storage();
const firestore = new Firestore();

export const parseUploadedPdf = async (event) => {
  const bucketName = event.bucket;
  const filePath = event.name;

  console.log(`File uploaded: ${filePath}`);

  // Extract userId and documentId from the path:
  // users/{uid}/documents/{docId}/filename.pdf
  const match = filePath.match(/users\/([^/]+)\/documents\/([^/]+)\//);
  if (!match) {
    console.log("Skipping file not in expected path.");
    return;
  }
  const [_, userId, documentId] = match;

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);

  // Download PDF into memory
  const [buffer] = await file.download();

  // Parse PDF using pdf-parse (simple option)
  const parsed = await pdfParse(buffer);

  // Write parsed results into Firestore
  await firestore
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(documentId)
    .set(
      {
        parsedText: parsed.text,
        numPages: parsed.numpages,
        info: parsed.info,
        parsedAt: new Date(),
        status: "parsed",
      },
      { merge: true }
    );

  console.log(`Finished parsing and stored results for ${filePath}`);
};