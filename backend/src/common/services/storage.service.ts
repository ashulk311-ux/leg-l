import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
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
  type: 's3' | 'minio' | 'local';
  bucket: string;
  region?: string;
  endpoint?: string;
  accessKey?: string;
  secretKey?: string;
  localPath?: string;
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
    const storageType = this.configService.get<string>('STORAGE_TYPE', 'local');
    
    this.config = {
      type: storageType as 's3' | 'minio' | 'local',
      bucket: this.configService.get<string>('STORAGE_BUCKET', 'legal-docs'),
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      endpoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      accessKey: this.configService.get<string>('AWS_ACCESS_KEY_ID') || 
                 this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 
                 this.configService.get<string>('MINIO_SECRET_KEY'),
      localPath: this.configService.get<string>('LOCAL_STORAGE_PATH', './uploads'),
    };

    if (this.config.type === 's3') {
      this.s3Client = new AWS.S3({
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
        region: this.config.region,
      });
    } else if (this.config.type === 'minio') {
      this.minioClient = new Minio.Client({
        endPoint: this.config.endpoint!,
        port: parseInt(this.configService.get<string>('MINIO_PORT', '9000')),
        useSSL: this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
        accessKey: this.config.accessKey!,
        secretKey: this.config.secretKey!,
      });
    } else if (this.config.type === 'local') {
      // Ensure local storage directory exists
      const uploadDir = path.resolve(this.config.localPath!);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
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
      } else if (this.config.type === 'minio') {
        return await this.uploadToMinio(file, key);
      } else if (this.config.type === 'local') {
        return await this.uploadToLocal(file, key);
      } else {
        throw new Error(`Unsupported storage type: ${this.config.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new BadRequestException('File upload failed');
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder: string = 'documents',
  ): Promise<UploadResult> {
    // Generate unique key
    const fileExtension = this.getFileExtension(filename);
    const fileName = `${uuidv4()}${fileExtension}`;
    const key = `${folder}/${fileName}`;

    try {
      if (this.config.type === 's3') {
        return await this.uploadBufferToS3(buffer, key, mimeType);
      } else if (this.config.type === 'minio') {
        return await this.uploadBufferToMinio(buffer, key, mimeType);
      } else if (this.config.type === 'local') {
        return await this.uploadBufferToLocal(buffer, key, mimeType);
      } else {
        throw new Error(`Unsupported storage type: ${this.config.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to upload buffer: ${error.message}`, error.stack);
      throw new BadRequestException('Buffer upload failed');
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

  private async uploadToLocal(file: Express.Multer.File, key: string): Promise<UploadResult> {
    const uploadDir = path.resolve(this.config.localPath!);
    const filePath = path.join(uploadDir, key);
    const fileDir = path.dirname(filePath);

    // Ensure directory exists
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    // Write file to local storage
    fs.writeFileSync(filePath, file.buffer);

    // Generate URL for local file
    const url = `http://localhost:3000/uploads/${key}`;

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
      } else if (this.config.type === 'minio') {
        await this.minioClient.removeObject(this.config.bucket, key);
      } else if (this.config.type === 'local') {
        const filePath = path.join(this.config.localPath!, key);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
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
      } else if (this.config.type === 'minio') {
        return await this.minioClient.presignedGetObject(
          this.config.bucket,
          key,
          expiresIn,
        );
      } else if (this.config.type === 'local') {
        return `http://localhost:3000/uploads/${key}`;
      } else {
        throw new Error(`Unsupported storage type: ${this.config.type}`);
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

  private async uploadBufferToS3(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.config.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ContentLength: buffer.length,
    };

    const result = await this.s3Client.upload(params).promise();

    return {
      key,
      bucket: this.config.bucket,
      url: result.Location,
      size: buffer.length,
      mimeType,
    };
  }

  private async uploadBufferToMinio(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult> {
    const result = await this.minioClient.putObject(
      this.config.bucket,
      key,
      buffer,
      buffer.length,
      { 'Content-Type': mimeType }
    );

    return {
      key,
      bucket: this.config.bucket,
      url: `${this.config.endpoint}/${this.config.bucket}/${key}`,
      size: buffer.length,
      mimeType,
    };
  }

  private async uploadBufferToLocal(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult> {
    const filePath = path.join(this.config.localPath, key);
    const dir = path.dirname(filePath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write buffer to file
    fs.writeFileSync(filePath, buffer);

    return {
      key,
      bucket: this.config.bucket,
      url: `file://${filePath}`,
      size: buffer.length,
      mimeType,
    };
  }

  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return '';
    }
    return filename.slice(lastDotIndex);
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
