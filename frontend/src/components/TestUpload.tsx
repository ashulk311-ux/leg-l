import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { documentService } from '../services/documents';
import { DocumentCategory } from '@shared/types';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import toast from 'react-hot-toast';

interface TestUploadProps {
  onUploadComplete?: () => void;
}

export function TestUpload({ onUploadComplete }: TestUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setProgress(0);

    try {
      const documentData = {
        title: `Test Upload - ${file.name}`,
        category: DocumentCategory.OTHER,
        isPublic: false,
        status: 'pending' as any,
        ownerId: '',
        filename: file.name,
        originalFilename: file.name,
        s3Key: '',
        s3Bucket: '',
        type: file.type.split('/')[1] as any,
        metadata: {
          size: file.size,
          mimeType: file.type,
          tags: ['test', 'upload'],
          ocrUsed: false,
        },
        permissions: {
          isPublic: false,
          allowedUsers: [],
          allowedRoles: [],
        },
      };

      const onProgress = (progressData: any) => {
        setProgress(progressData.percentage);
      };

      await documentService.uploadDocument(file, documentData, onProgress);
      
      toast.success('Document uploaded successfully!');
      onUploadComplete?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
    disabled: uploading,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Document Upload</CardTitle>
        <CardDescription>Test the document upload functionality</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="space-y-4">
              <div className="text-lg text-primary-600">Uploading...</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-sm text-gray-500">{progress}%</div>
            </div>
          ) : isDragActive ? (
            <div className="text-lg text-primary-600">Drop the file here...</div>
          ) : (
            <div>
              <div className="text-lg text-gray-600 mb-2">
                Drag & drop a file here, or click to select
              </div>
              <div className="text-sm text-gray-500">
                Supports PDF, DOCX, DOC, TXT (max 50MB)
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
