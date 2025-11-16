'use client';

import React, { useEffect, useState } from 'react';
import { getDocs, invalidateDocsCache } from '@/lib/docCache';

export default function DocumentModal({ isOpen, onCloseProp }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const files = await getDocs();
        if (!cancelled) setDocs(files || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        if (!cancelled) setError(err.message || 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onCloseProp?.()} />
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Uploaded Documents</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                // force refresh
                setLoading(true);
                setError(null);
                try {
                  invalidateDocsCache();
                  const files = await getDocs({ force: true });
                  setDocs(files || []);
                } catch (err) {
                  console.error(err);
                  setError(err.message || 'Error');
                } finally {
                  setLoading(false);
                }
              }}
              className="text-sm text-gray-600"
            >
              Refresh
            </button>
            <button type="button" onClick={() => onCloseProp?.()} className="text-sm text-gray-600">Close</button>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-600">Loading documents…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="overflow-auto max-h-72">
            {docs.length === 0 ? (
              <p className="text-sm text-gray-600">No documents found.</p>
            ) : (
              <ul className="space-y-2">
                {docs.map((f) => (
                  <li key={f.name} className="flex items-center justify-between p-2 rounded bg-gray-50">
                    <div className="truncate">
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-gray-500">{f.contentType || '—'} • {f.size ? `${Math.round(f.size/1024)} KB` : '—'}</div>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">{f.updated ? new Date(f.updated).toLocaleString() : ''}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={() => onCloseProp?.()}
            className="px-3 py-1 text-sm bg-gray-100 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
