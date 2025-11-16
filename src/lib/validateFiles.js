// helper validator
export function validateFiles(files, maxSize = 5 * 1024 * 1024, allowedTypes = ['application/pdf']) {
    let error = false;
    if (!files || files.length < 1) return { ok: false, error: "No files selected"};

    Array.from(files).forEach(file => {
      console.log("file", file)
      if (files.size > maxSize) {
          error = `${files.name} is too large (${Math.round(files.size/1024)} KB). Max ${Math.round(maxSize/1024)} KB.`;
      }
    })



  return { ok: !error, error };
}