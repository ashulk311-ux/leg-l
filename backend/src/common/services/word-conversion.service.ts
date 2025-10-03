import { Injectable, Logger } from '@nestjs/common';
import { ChunksService } from '../../chunks/chunks.service';
import { StorageService } from './storage.service';
import { Document } from 'mongoose';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class WordConversionService {
  private readonly logger = new Logger(WordConversionService.name);

  constructor(
    private readonly chunksService: ChunksService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Process document text and create both chunks and Word document using Python
   */
  async processDocumentWithPython(documentId: string, text: string, title: string): Promise<{ chunks: any[]; wordBuffer: Buffer }> {
    this.logger.log(`Processing document ${documentId} with Python (text length: ${text.length})`);

    try {
      // Prepare input data for Python script
      const inputData = {
        text: text,
        title: title,
        max_chunk_size: 1000,
        overlap_size: 200
      };

      const inputJson = JSON.stringify(inputData);

      // Get the path to the Python script
      const scriptPath = path.join(__dirname, 'python-document-processor.py');

      // Execute Python script
      const result = await this.executePythonDocumentProcessor(scriptPath, inputJson);
      
      this.logger.log(`Successfully processed document ${documentId} with Python`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to process document ${documentId} with Python: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Convert document chunks to editable Word format using Python
   */
  async convertChunksToWord(documentId: string, chunks: any[]): Promise<Buffer> {
    this.logger.log(`Converting ${chunks.length} chunks to Word format for document ${documentId}`);

    try {
      // Prepare chunks data for Python script
      const chunksData = chunks.map(chunk => ({
        chunkText: chunk.chunkText,
        metadata: chunk.metadata || {},
        tokenCount: chunk.tokenCount,
        startPos: chunk.startPos,
        endPos: chunk.endPos,
      }));

      // Convert chunks to JSON
      const chunksJson = JSON.stringify(chunksData);

      // Get the path to the Python script
      const scriptPath = path.join(__dirname, 'python-word-converter.py');

      // Execute Python script
      const wordBuffer = await this.executePythonScript(scriptPath, chunksJson);
      
      this.logger.log(`Successfully converted document ${documentId} to Word format`);
      return wordBuffer;
    } catch (error) {
      this.logger.error(`Failed to convert document ${documentId} to Word format: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Execute Python document processor script
   */
  private async executePythonDocumentProcessor(scriptPath: string, inputJson: string): Promise<{ chunks: any[]; wordBuffer: Buffer }> {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', [scriptPath, '--input', inputJson]);
      
      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          this.logger.error(`Python document processor failed with code ${code}: ${stderr}`);
          reject(new Error(`Python document processor failed: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());
          
          if (result.error) {
            reject(new Error(result.error));
            return;
          }

          // Convert hex string back to buffer
          const wordBuffer = Buffer.from(result.word_document, 'hex');
          
          resolve({
            chunks: result.chunks,
            wordBuffer: wordBuffer
          });
        } catch (error) {
          this.logger.error(`Failed to parse Python output: ${error.message}`);
          reject(error);
        }
      });

      python.on('error', (error) => {
        this.logger.error(`Failed to start Python document processor: ${error.message}`);
        reject(error);
      });
    });
  }

  /**
   * Execute Python script to convert chunks to Word
   */
  private async executePythonScript(scriptPath: string, chunksJson: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', [scriptPath, '--chunks', chunksJson]);
      
      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          this.logger.error(`Python script failed with code ${code}: ${stderr}`);
          reject(new Error(`Python script failed: ${stderr}`));
          return;
        }

        try {
          // Decode base64 output from Python script
          const wordBuffer = Buffer.from(stdout.trim(), 'base64');
          resolve(wordBuffer);
        } catch (error) {
          this.logger.error(`Failed to decode Python output: ${error.message}`);
          reject(error);
        }
      });

      python.on('error', (error) => {
        this.logger.error(`Failed to start Python script: ${error.message}`);
        reject(error);
      });
    });
  }


  /**
   * Store Word document and return download URL
   */
  async storeWordDocument(documentId: string, wordBuffer: Buffer): Promise<string> {
    const filename = `word-${documentId}.docx`;
    const uploadResult = await this.storageService.uploadBuffer(wordBuffer, filename, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    return uploadResult.key;
  }
}
