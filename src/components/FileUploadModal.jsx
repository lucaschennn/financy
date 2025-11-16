'use client';

import { useState, useEffect } from 'react';
import { validateFiles } from '@/lib/validateFiles';

export default function FileUploadModal({ isOpen, onCloseProp, onUpload }) {

  const onClose = () => {
    setProgress({midUpload: false, state: 0});
    setErrors([]);
    onCloseProp?.();
  }

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const [errors, setErrors] = useState([]);
  const [progress, setProgress] = useState({midUpload: false, state: 0})
  const [fileText, setFileText] = useState("");

  if (!isOpen) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const handleProgressUpdate = (progress) => {
    setProgress({midUpload: progress < 1 && progress > 0, state: progress});
    console.log("Upload progress:", progress);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const files = e.target.elements?.file?.files;
    const validation = validateFiles(files);
    // if (!validation.ok) {
    //     setErrors([validation.error]);
    //     return;
    // }
    onUpload?.(files, { onProgress: handleProgressUpdate});
    setFileText(`Uploaded ${files[0].name} successfully!`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upload documents</h3>
          <button
            onClick={onClose}
            aria-label="Close upload dialog"
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block mb-3">
            <input accept="application/pdf" name="file" type="file" multiple className="block w-full cursor-pointer" />
          </label>
          <div id="error-messages" className="mb-4">
            {errors.length > 0 && (
              <ul className="text-sm text-red-600 list-disc list-inside">
                {errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                ))}
                </ul>
            )}
          </div>
          {
            progress.state === 1 &&
            <div className="mb-4 text-green-600">
              {fileText}
            </div>
          }

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">
              Cancel
            </button>
            {
              progress.state < 1 && 
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
                Upload
              </button>
            }

          </div>
        </form>
      </div>
    </div>
  );
}
