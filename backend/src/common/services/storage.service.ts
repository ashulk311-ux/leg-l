import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import { 
  MAX_FILE_SIZE, 
  ALLOWED_FILE_TYPES, 
  ALLOWED_FILE_EXTENSIONS 
} from '@legal-docs/shared';

export interface UploadResult {
  key: string;
  bucket: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface StorageConfig {
  type: 's3' | 'minio';
  bucket: string;
  region?: string;
  endpoint?: string;
  accessKey?: string;
  secretKey?: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: AWS.S3;
  private minioClient: Minio.Client;
  private config: StorageConfig;

  constructor(private readonly configService: ConfigService) {
    this.initializeStorage();
  }

  private initializeStorage() {
    const storageType = this.configService.get<string>('STORAGE_TYPE', 'minio');
    
    this.config = {
      type: storageType as 's3' | 'minio',
      bucket: this.configService.get<string>('STORAGE_BUCKET', 'legal-docs'),
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      endpoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      accessKey: this.configService.get<string>('AWS_ACCESS_KEY_ID') || 
                 this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 
                 this.configService.get<string>('MINIO_SECRET_KEY'),
    };

    if (this.config.type === 's3') {
      this.s3Client = new AWS.S3({
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
        region: this.config.region,
      });
    } else {
      this.minioClient = new Minio.Client({
        endPoint: this.config.endpoint!,
        port: parseInt(this.configService.get<string>('MINIO_PORT', '9000')),
        useSSL: this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
        accessKey: this.config.accessKey!,
        secretKey: this.config.secretKey!,
      });
    }

    this.logger.log(`Storage service initialized with ${this.config.type}`);
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'documents',
  ): Promise<UploadResult> {
    // Validate file
    this.validateFile(file);

    // Generate unique key
    const fileExtension = this.getFileExtension(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const key = `${folder}/${fileName}`;

    try {
      if (this.config.type === 's3') {
        return await this.uploadToS3(file, key);
      } else {
        return await this.uploadToMinio(file, key);
      }
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new BadRequestException('File upload failed');
    }
  }

  private async uploadToS3(file: Express.Multer.File, key: string): Promise<UploadResult> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.config.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    };

    const result = await this.s3Client.upload(params).promise();

    return {
      key,
      bucket: this.config.bucket,
      url: result.Location,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  private async uploadToMinio(file: Express.Multer.File, key: string): Promise<UploadResult> {
    // Ensure bucket exists
    const bucketExists = await this.minioClient.bucketExists(this.config.bucket);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.config.bucket, this.config.region);
    }

    // Upload file
    await this.minioClient.putObject(
      this.config.bucket,
      key,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    const url = `${this.config.endpoint}:${this.configService.get<string>('MINIO_PORT', '9000')}/${this.config.bucket}/${key}`;

    return {
      key,
      bucket: this.config.bucket,
      url,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async deleteFile(key: string): Promise<void> {
    try {
      if (this.config.type === 's3') {
        await this.s3Client.deleteObject({
          Bucket: this.config.bucket,
          Key: key,
        }).promise();
      } else {
        await this.minioClient.removeObject(this.config.bucket, key);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}: ${error.message}`, error.stack);
      throw new BadRequestException('File deletion failed');
    }
  }

  async getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      if (this.config.type === 's3') {
        return this.s3Client.getSignedUrl('getObject', {
          Bucket: this.config.bucket,
          Key: key,
          Expires: expiresIn,
        });
      } else {
        return await this.minioClient.presignedGetObject(
          this.config.bucket,
          key,
          expiresIn,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to generate file URL for ${key}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to generate file URL');
    }
  }

  private validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
      );
    }

    // Check file extension
    const extension = this.getFileExtension(file.originalname);
    if (!ALLOWED_FILE_EXTENSIONS.includes(extension.toLowerCase())) {
      throw new BadRequestException(
        `File extension ${extension} is not allowed. Allowed extensions: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`,
      );
    }
  }

  private getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  async getFileMetadata(key: string): Promise<any> {
    try {
      if (this.config.type === 's3') {
        const result = await this.s3Client.headObject({
          Bucket: this.config.bucket,
          Key: key,
        }).promise();

        return {
          size: result.ContentLength,
          mimeType: result.ContentType,
          lastModified: result.LastModified,
          etag: result.ETag,
        };
      } else {
        const stat = await this.minioClient.statObject(this.config.bucket, key);
        return {
          size: stat.size,
          mimeType: stat.metaData['content-type'],
          lastModified: stat.lastModified,
          etag: stat.etag,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to get file metadata for ${key}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to get file metadata');
    }
  }
}
