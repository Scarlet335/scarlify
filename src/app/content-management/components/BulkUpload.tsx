'use client';
import { useState } from 'react';
import { Upload, Download, X } from 'lucide-react';

export default function BulkUpload({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ inserted: number; errors: number } | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/bulk-upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    setResult(data);
    setUploading(false);
  };

  const downloadTemplate = () => {
    const headers = ['subject', 'year', 'paper_type', 'question_text', 'correct_answer', 'pdf_url'];
    const csvContent = headers.join(',') + '\n' + 'Physics,2023,Paper 1,"What is force?",Force = mass × acceleration,\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Upload Questions</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          Upload a CSV or Excel file with multiple questions at once.
        </p>

        <button
          onClick={downloadTemplate}
          className="mb-4 text-primary text-sm flex items-center gap-1 hover:underline"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center mb-4 bg-gray-50 dark:bg-gray-700/50">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          />
          {file && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">Selected: {file.name}</p>
          )}
        </div>

        {result && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            result.errors > 0 
              ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800' 
              : 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
          }`}>
            ✅ {result.inserted} questions uploaded
            {result.errors > 0 && <span> ⚠️ {result.errors} failed</span>}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 bg-primary text-white rounded-lg py-2 disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>
    </div>
  );
}