import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useDocumentStore } from '../stores/documents';
import { DocumentCategory } from '@shared/types';

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadDocument } = useDocumentStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading',
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif'],
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    try {
      setIsUploading(true);
      
      // Process each file
      for (const uploadedFile of uploadedFiles) {
        if (uploadedFile.status === 'error') continue;

        try {
          // Update status to processing
          setUploadedFiles((prev) =>
            prev.map((file) =>
              file.id === uploadedFile.id ? { ...file, status: 'processing' } : file
            )
          );

          // Prepare form data with default values
          const formData = new FormData();
          formData.append('file', uploadedFile.file);
          formData.append('title', uploadedFile.file.name.replace(/\.[^/.]+$/, '')); // Use filename as title
          formData.append('description', '');
          formData.append('category', DocumentCategory.OTHER);
          formData.append('jurisdiction', '');
          formData.append('court', '');
          formData.append('year', '');
          formData.append('caseNumber', '');
          formData.append('tags', '');
          formData.append('isPublic', 'false');

          // Upload document
          await uploadDocument(formData);

          // Update status to completed
          setUploadedFiles((prev) =>
            prev.map((file) =>
              file.id === uploadedFile.id ? { ...file, status: 'completed', progress: 100 } : file
            )
          );

        } catch (error: any) {
          // Update status to error
          setUploadedFiles((prev) =>
            prev.map((file) =>
              file.id === uploadedFile.id
                ? { ...file, status: 'error', error: error.message }
                : file
            )
          );
        }
      }

      // Check if any files were successfully uploaded
      const hasSuccessfulUploads = uploadedFiles.some((file) => file.status === 'completed');
      
      if (hasSuccessfulUploads) {
        toast.success('Files uploaded successfully! Processing will begin shortly.');
        setUploadedFiles([]);
      } else {
        toast.error('Failed to upload files. Please try again.');
      }

    } catch (error: any) {
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600';
      case 'processing':
        return 'text-yellow-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <CloudArrowUpIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload your legal documents for processing and analysis
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* File Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Select Files</CardTitle>
              <CardDescription>
                Drag and drop files here or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {isDragActive
                    ? 'Drop the files here...'
                    : 'Drag & drop files here, or click to select files'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports PDF, DOC, DOCX, TXT, JPG, PNG, TIFF (max 50MB each)
                </p>
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Selected Files</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((uploadedFile) => (
                      <div
                        key={uploadedFile.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <DocumentIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {uploadedFile.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs font-medium ${getStatusColor(uploadedFile.status)}`}
                          >
                            {getStatusText(uploadedFile.status)}
                          </span>
                          {uploadedFile.status !== 'completed' && (
                            <button
                              onClick={() => removeFile(uploadedFile.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Upload Button */}
                  <div className="mt-6">
                    <Button
                      onClick={handleUpload}
                      className="w-full"
                      loading={isUploading}
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Upload Documents'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
