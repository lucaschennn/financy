const functions = require('@google-cloud/functions-framework');

// Register a CloudEvent callback with the Functions Framework that will
// be triggered by Cloud Storage.
functions.cloudEvent("parseUploadedPdf", async (cloudEvent) => {
  console.log(`Received CloudEvent ${cloudEvent.id}`);
  console.log(`Type: ${cloudEvent.type}`);

  const file = cloudEvent.data;

  // Storage metadata
  const bucket = file.bucket;
  const name = file.name;
  const contentType = file.contentType;
  const metageneration = file.metageneration;
  const timeCreated = file.timeCreated;

  console.log("=== New Cloud Storage Upload ===");
  console.log(`Bucket: ${bucket}`);
  console.log(`File: ${name}`);
  console.log(`Content Type: ${contentType}`);
  console.log(`Metageneration: ${metageneration}`);
  console.log(`Created: ${timeCreated}`);

  // Only process PDFs
  if (!contentType || !contentType.includes("pdf")) {
    console.log("Not a PDF — ignoring.");
    return;
  }

  console.log(`Processing uploaded PDF: gs://${bucket}/${name}`);

  // TODO: Insert your PDF parsing logic here
  // e.g., download file, parse text, extract data, call other services, etc.

  console.log("PDF parsing completed (placeholder).");
});
