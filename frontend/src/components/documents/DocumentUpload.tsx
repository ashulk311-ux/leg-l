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

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.nativeEnum(DocumentCategory, { message: 'Category is required' }),
  tags: z.string().optional(),
  jurisdiction: z.string().optional(),
  court: z.string().optional(),
  year: z.number().min(1900).max(new Date().getFullYear()).optional(),
  caseNumber: z.string().optional(),
  isPublic: z.boolean().default(false),
  allowedUsers: z.string().optional(),
  allowedRoles: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export function DocumentUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UploadFormData>({
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

  const onSubmit = async (data: UploadFormData) => {
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
            category: data.category,
            tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
            jurisdiction: data.jurisdiction,
            court: data.court,
            year: data.year,
            caseNumber: data.caseNumber,
            isPublic: data.isPublic,
            allowedUsers: data.allowedUsers ? data.allowedUsers.split(',').map(user => user.trim()) : [],
            allowedRoles: data.allowedRoles ? data.allowedRoles.split(',').map(role => role.trim()) : [],
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
          switch (data.category) {
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

          return uploadedFile.file.name;
        } catch (error: any) {
          setUploadedFiles(prev => 
            prev.map(file => 
              file.id === uploadedFile.id 
                ? { ...file, status: 'error', error: error.message }
                : file
            )
          );
          throw error;
        }
      });

      const uploadedNames = await Promise.all(uploadPromises);
      toast.success(`Successfully uploaded ${uploadedNames.length} document(s)`);
      
      // Reset form and files
      reset();
      setUploadedFiles([]);
    } catch (error: any) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('text')) return '📃';
    if (type.includes('image')) return '🖼️';
    return '📎';
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">📤 Upload Documents</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Upload legal documents for processing and indexing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* File Drop Zone */}
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200',
                isDragActive 
                  ? 'border-blue-500 bg-blue-50 scale-105' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
              )}
            >
              <input {...getInputProps()} />
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <CloudArrowUpIcon className="h-8 w-8 text-blue-600" />
              </div>
              {isDragActive ? (
                <p className="text-xl font-semibold text-blue-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-xl font-semibold text-gray-700 mb-3">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports PDF, DOCX, TXT, JPG, PNG, TIFF (max 50MB each)
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">
                    Choose Files
                  </div>
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

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  {...register('category')}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select category</option>
                  {Object.values(DocumentCategory).map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-error-600">{errors.category.message}</p>
                )}
              </div>

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
                        <XMarkIcon className="h-4 w-4" />
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
