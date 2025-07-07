import React, { useState, useCallback } from 'react';
import { uploadFile } from '../services/api';
import type { UploadResponse } from '../types';
import { UploadIcon } from './icons';
import Loader from './Loader';

interface FileUploadProps {
  onUploadSuccess: (data: UploadResponse) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'text/xml' || file.name.endsWith('.xml')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a valid XML file.');
        setSelectedFile(null);
      }
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (file.type === 'text/xml' || file.name.endsWith('.xml')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a valid XML file.');
        setSelectedFile(null);
      }
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadFile(selectedFile);
      onUploadSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Your Health Data</h2>
        <p className="text-slate-600 mb-6">Upload your Apple Health `export.xml` file to get started.</p>

        {isUploading ? (
          <Loader text="Uploading and processing file..." />
        ) : (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-lg p-10 cursor-pointer transition-colors duration-200 ease-in-out ${isDragOver ? 'border-sky-500 bg-sky-50' : 'border-slate-300 hover:border-sky-400'}`}
            >
              <input
                type="file"
                accept=".xml,text/xml"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <UploadIcon className="h-12 w-12 text-slate-400" />
                <p className="text-slate-700 font-semibold">
                  <label htmlFor="file-upload" className="text-sky-600 hover:text-sky-800 cursor-pointer">
                    Click to upload
                  </label> or drag and drop
                </p>
                <p className="text-xs text-slate-500">Apple Health XML file</p>
              </div>
            </div>

            {selectedFile && (
              <div className="mt-4 text-left bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-slate-700">Selected file: <span className="font-bold text-slate-900">{selectedFile.name}</span></p>
              </div>
            )}
            
            {error && <p className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
            
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="mt-6 w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
            >
              Upload and Analyze
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;