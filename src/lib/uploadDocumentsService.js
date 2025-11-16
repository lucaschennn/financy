/**
 * Upload files to the server.
 * @param {FileList|File[]} files - FileList or array of File objects
 * @param {Object} [options]
 * @param {string} [options.url='/api/doc-upload'] - endpoint to POST to
 * @param {(progress: number) => void} [options.onProgress] - optional progress callback (0..1)
 * @returns {Promise<any>} resolves with parsed JSON response
 */
export function uploadDocumentsService(files, { url = '/api/doc-upload', onProgress } = {}) {
	if (!files) return Promise.reject(new Error('No files provided'));

	// normalize FileList to array
	const fileArray = Array.isArray(files) ? files : Array.from(files);
	if (fileArray.length === 0) return Promise.reject(new Error('No files provided'));

	const formData = new FormData();
	// Append files under the 'files' key (server should accept multiple values)
	fileArray.forEach((file) => formData.append('files', file));

	// If caller provided onProgress, use XHR to report upload progress
	if (typeof onProgress === 'function' && typeof window !== 'undefined' && window.XMLHttpRequest) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', url, true);

			xhr.onreadystatechange = () => {
				if (xhr.readyState !== 4) return;
				const status = xhr.status === 1223 ? 204 : xhr.status; // IE weirdness
				if (status >= 200 && status < 300) {
					try {
						const json = xhr.response ? JSON.parse(xhr.response) : null;
						resolve(json);
					} catch (err) {
						// not JSON
						resolve(xhr.responseText);
					}
				} else {
					reject(new Error(`Upload failed with status ${status}`));
				}
			};

			xhr.onerror = () => reject(new Error('Network error during upload'));

			if (xhr.upload && typeof xhr.upload.addEventListener === 'function') {
				xhr.upload.addEventListener('progress', (e) => {
					if (!e.lengthComputable) return;
					try {
						const progress = e.loaded / e.total;
						onProgress(progress);
					} catch (err) {
						// ignore errors in callback
					}
				});
			}

			xhr.send(formData);
		});
	}

	// Fallback: use fetch (no progress reporting)
	return fetch(url, { method: 'POST', body: formData }).then(async (res) => {
		if (!res.ok) {
			const text = await res.text().catch(() => console.log("res", res));
			throw new Error(`Upload failed: ${res.status} ${res.statusText} ${text}`);
		}
		const ct = res.headers.get('content-type') || '';
		if (ct.includes('application/json')) return res.json();
		return res.text();
	});
}