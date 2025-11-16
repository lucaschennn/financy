'use client';

import { useState } from 'react';
import DraggableComponent from '@/components/DraggableComponent';
import FileUploadModal from '@/components/FileUploadModal';
import DocumentModal from '@/components/DocumentModal';
import { uploadDocumentsService } from '@/lib/uploadDocumentsService';

export const WIDGET_GRID_DIM = { x: 3, y: 3 };
// Example dashboard components
const DashboardCard = ({ title, children }) => (
  //TEST ONLY
  <div>
    <h3 className="font-semibold mb-2">{title}</h3>
    {children}
  </div>
);

export default function Home() {

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  
  return (
    <main className="relative min-h-screen bg-gray-100 p-8">
      {/* header: h1 and small paragraph share the same baseline */}
      <div className="flex items-baseline gap-4 mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          type="button"
          onClick={() => setUploadModalOpen(true)}
          className="m-0 text-sm text-gray-600 underline hover:text-gray-800"
        >
          Upload Documents
        </button>
        <button
          type="button"
          onClick={() => setDocumentModalOpen(true)}
          className="m-0 text-sm text-gray-600 underline hover:text-gray-800"
        >
          My Documents
        </button>
      </div>
      
      <div className="relative" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Example draggable components */}
        <DraggableComponent widgetId={"Statistics"} initialGridPosition={{ x: 0, y: 0 }}>
          <DashboardCard title="Statistics">
            <p>Sample statistics content</p>
          </DashboardCard>
        </DraggableComponent>

        <DraggableComponent widgetId={"Recent Activity"} initialGridPosition={{ x: 1, y: 0 }}>
          <DashboardCard title="Recent Activity">
            <p>Sample activity feed</p>
          </DashboardCard>
        </DraggableComponent>

        <DraggableComponent widgetId={"Performance"} initialGridPosition={{ x: 2, y: 0 }}>
          <DashboardCard title="Performance">
            <p>Sample performance metrics</p>
          </DashboardCard>
        </DraggableComponent>

        <DraggableComponent widgetId={"Tasks"} initialGridPosition={{ x: 0, y: 1 }}>
          <DashboardCard title="Tasks">
            <p>Sample task list</p>
          </DashboardCard>
        </DraggableComponent>
      </div>
      <FileUploadModal
        isOpen={uploadModalOpen}
        onCloseProp={() => setUploadModalOpen(false)}
        onUpload={uploadDocumentsService}
      />
      <DocumentModal
        isOpen={documentModalOpen}
        onCloseProp={() => setDocumentModalOpen(false)}
      /> 
    </main>
  );
}
