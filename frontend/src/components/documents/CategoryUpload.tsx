import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { documentService, DocumentUploadProgress } from '../../services/documents';
import { DocumentCategory } from '@shared/types';
import { cn } from '../../utils/cn';
import { formatFileSize } from '../../utils/format';

const categoryUploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  tags: z.string().optional(),
  jurisdiction: z.string().optional(),
  court: z.string().optional(),
  year: z.number().min(1900).max(new Date().getFullYear()).optional(),
  caseNumber: z.string().optional(),
  isPublic: z.boolean().default(false),
  allowedUsers: z.string().optional(),
  allowedRoles: z.string().optional(),
});

type CategoryUploadFormData = z.infer<typeof categoryUploadSchema>;

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface CategoryUploadProps {
  category: DocumentCategory;
  onUploadComplete?: () => void;
}

export function CategoryUpload({ category, onUploadComplete }: CategoryUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryUploadFormData>({
    defaultValues: {
      isPublic: false,
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading',
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
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
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const onSubmit = async (data: CategoryUploadFormData) => {
    if (uploadedFiles.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = uploadedFiles.map(async (uploadedFile) => {
        try {
          const documentData = {
            title: data.title,
            category: category,
            isPublic: data.isPublic,
            status: 'pending' as any,
            ownerId: '',
            filename: uploadedFile.file.name,
            originalFilename: uploadedFile.file.name,
            s3Key: '',
            s3Bucket: '',
            type: uploadedFile.file.type.split('/')[1] as any,
            metadata: {
              size: uploadedFile.file.size,
              mimeType: uploadedFile.file.type,
              tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
              ocrUsed: false,
              jurisdiction: data.jurisdiction,
              court: data.court,
              year: data.year,
              caseNumber: data.caseNumber,
            },
            permissions: {
              isPublic: data.isPublic,
              allowedUsers: data.allowedUsers ? data.allowedUsers.split(',').map(user => user.trim()) : [],
              allowedRoles: data.allowedRoles ? data.allowedRoles.split(',').map(role => role.trim()) : [],
            },
          };

          const onProgress = (progress: DocumentUploadProgress) => {
            setUploadedFiles(prev => 
              prev.map(file => 
                file.id === uploadedFile.id 
                  ? { ...file, progress: progress.percentage }
                  : file
              )
            );
          };

          // Use category-specific upload method
          let uploadPromise;
          switch (category) {
            case DocumentCategory.JUDGEMENT:
              uploadPromise = documentService.uploadJudgement(uploadedFile.file, documentData, onProgress);
              break;
            case DocumentCategory.CIRCULAR:
              uploadPromise = documentService.uploadCircular(uploadedFile.file, documentData, onProgress);
              break;
            case DocumentCategory.NOTIFICATION:
              uploadPromise = documentService.uploadNotification(uploadedFile.file, documentData, onProgress);
              break;
            case DocumentCategory.STATUTE:
              uploadPromise = documentService.uploadStatute(uploadedFile.file, documentData, onProgress);
              break;
            default:
              uploadPromise = documentService.uploadDocument(uploadedFile.file, documentData, onProgress);
          }

          await uploadPromise;

          setUploadedFiles(prev => 
            prev.map(file => 
              file.id === uploadedFile.id 
                ? { ...file, status: 'completed', progress: 100 }
                : file
            )
          );
        } catch (error) {
          console.error('Upload error:', error);
          setUploadedFiles(prev => 
            prev.map(file => 
              file.id === uploadedFile.id 
                ? { ...file, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
                : file
            )
          );
        }
      });

      await Promise.all(uploadPromises);

      const successCount = uploadedFiles.filter(f => f.status === 'completed').length;
      const errorCount = uploadedFiles.filter(f => f.status === 'error').length;

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} document(s)`);
        reset();
        setUploadedFiles([]);
        onUploadComplete?.();
      }

      if (errorCount > 0) {
        toast.error(`Failed to upload ${errorCount} document(s)`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'tiff':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getCategoryTitle = (category: DocumentCategory) => {
    switch (category) {
      case DocumentCategory.JUDGEMENT:
        return 'Upload Judgement Documents';
      case DocumentCategory.CIRCULAR:
        return 'Upload Circular Documents';
      case DocumentCategory.NOTIFICATION:
        return 'Upload Notification Documents';
      case DocumentCategory.STATUTE:
        return 'Upload Statute Documents';
      default:
        return 'Upload Documents';
    }
  };

  const getCategoryDescription = (category: DocumentCategory) => {
    switch (category) {
      case DocumentCategory.JUDGEMENT:
        return 'Upload court judgements and legal decisions for processing and indexing';
      case DocumentCategory.CIRCULAR:
        return 'Upload government and official circulars for processing and indexing';
      case DocumentCategory.NOTIFICATION:
        return 'Upload legal notifications and announcements for processing and indexing';
      case DocumentCategory.STATUTE:
        return 'Upload legal statutes and regulations for processing and indexing';
      default:
        return 'Upload legal documents for processing and indexing';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>{getCategoryTitle(category)}</CardTitle>
          <CardDescription>
            {getCategoryDescription(category)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* File Drop Zone */}
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-lg text-primary-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-lg text-gray-600 mb-2">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOCX, TXT, JPG, PNG, TIFF (max 50MB each)
                  </p>
                </div>
              )}
            </div>

            {/* Document Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('title')}
                label="Document Title *"
                placeholder="Enter document title"
                error={errors.title?.message}
              />

              <Input
                {...register('tags')}
                label="Tags"
                placeholder="Enter tags separated by commas"
                helperText="e.g., contract, intellectual property, employment"
              />

              <Input
                {...register('jurisdiction')}
                label="Jurisdiction"
                placeholder="e.g., California, Federal, International"
              />

              <Input
                {...register('court')}
                label="Court"
                placeholder="e.g., Supreme Court, District Court"
              />

              <Input
                {...register('year', { valueAsNumber: true })}
                type="number"
                label="Year"
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear()}
              />

              <Input
                {...register('caseNumber')}
                label="Case Number"
                placeholder="e.g., 2024-CV-001"
              />
            </div>

            {/* Public Access Toggle */}
            <div className="flex items-center">
              <input
                {...register('isPublic')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Make this document publicly searchable
              </label>
            </div>

            {/* Permission Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('allowedUsers')}
                label="Allowed Users"
                placeholder="Enter user emails separated by commas"
                helperText="Specific users who can access this document"
              />

              <Input
                {...register('allowedRoles')}
                label="Allowed Roles"
                placeholder="Enter roles separated by commas"
                helperText="e.g., admin, lawyer, paralegal"
              />
            </div>

            {/* Upload Button */}
            <Button
              type="submit"
              className="w-full"
              loading={isUploading}
              disabled={isUploading || uploadedFiles.length === 0}
            >
              {isUploading ? 'Uploading...' : `Upload ${uploadedFiles.length} Document(s)`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files</CardTitle>
            <CardDescription>
              {uploadedFiles.length} file(s) ready for upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(uploadedFile.file)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{uploadedFile.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                      {uploadedFile.error && (
                        <p className="text-sm text-red-500">{uploadedFile.error}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {uploadedFile.status === 'uploading' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadedFile.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">
                          {uploadedFile.progress}%
                        </span>
                      </div>
                    )}

                    {getStatusIcon(uploadedFile.status)}

                    {uploadedFile.status !== 'uploading' && (
                      <button
                        onClick={() => removeFile(uploadedFile.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
