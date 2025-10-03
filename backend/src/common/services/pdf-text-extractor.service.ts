import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

@Injectable()
export class PdfTextExtractorService {
  private readonly logger = new Logger(PdfTextExtractorService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Extract text from PDF using Python pdfplumber
   */
  async extractTextFromPdf(filePath: string): Promise<string> {
    try {
      this.logger.log(`Extracting text from PDF: ${filePath}`);

      // Create a Python script to extract text
      const pythonScript = `
import sys
import json
import pdfplumber
import os

def extract_pdf_text(file_path):
    try:
        text_content = ""
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    text_content += f"\\n\\n--- Page {page_num} ---\\n\\n"
                    text_content += page_text
        
        return {
            "success": True,
            "text": text_content.strip(),
            "page_count": len(pdf.pages) if 'pdf' in locals() else 0
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "text": ""
        }

if __name__ == "__main__":
    file_path = sys.argv[1]
    result = extract_pdf_text(file_path)
    print(json.dumps(result))
`;

      // Write the Python script to a temporary file
      const tempScriptPath = path.join(process.cwd(), 'temp_pdf_extractor.py');
      await promisify(fs.writeFile)(tempScriptPath, pythonScript);

      // Execute the Python script
      const result = await this.executePythonScript(tempScriptPath, [filePath]);
      
      // Clean up the temporary script
      await promisify(fs.unlink)(tempScriptPath).catch(() => {});

      if (result.success) {
        this.logger.log(`Successfully extracted text from PDF: ${result.page_count} pages`);
        return result.text;
      } else {
        this.logger.error(`Failed to extract text from PDF: ${result.error}`);
        throw new Error(`PDF text extraction failed: ${result.error}`);
      }

    } catch (error) {
      this.logger.error(`Error extracting text from PDF: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract text from DOCX files
   */
  async extractTextFromDocx(filePath: string): Promise<string> {
    try {
      this.logger.log(`Extracting text from DOCX: ${filePath}`);

      const pythonScript = `
import sys
import json
from docx import Document

def extract_docx_text(file_path):
    try:
        doc = Document(file_path)
        text_content = ""
        
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_content += paragraph.text + "\\n"
        
        return {
            "success": True,
            "text": text_content.strip()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "text": ""
        }

if __name__ == "__main__":
    file_path = sys.argv[1]
    result = extract_docx_text(file_path)
    print(json.dumps(result))
`;

      const tempScriptPath = path.join(process.cwd(), 'temp_docx_extractor.py');
      await promisify(fs.writeFile)(tempScriptPath, pythonScript);

      const result = await this.executePythonScript(tempScriptPath, [filePath]);
      
      await promisify(fs.unlink)(tempScriptPath).catch(() => {});

      if (result.success) {
        this.logger.log(`Successfully extracted text from DOCX`);
        return result.text;
      } else {
        this.logger.error(`Failed to extract text from DOCX: ${result.error}`);
        throw new Error(`DOCX text extraction failed: ${result.error}`);
      }

    } catch (error) {
      this.logger.error(`Error extracting text from DOCX: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract text from TXT files
   */
  async extractTextFromTxt(filePath: string): Promise<string> {
    try {
      this.logger.log(`Extracting text from TXT: ${filePath}`);
      
      const content = await promisify(fs.readFile)(filePath, 'utf-8');
      return content;
    } catch (error) {
      this.logger.error(`Error extracting text from TXT: ${error.message}`);
      throw error;
    }
  }

  /**
   * Main method to extract text from any supported file type
   */
  async extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
    const fileExtension = path.extname(filePath).toLowerCase();

    try {
      switch (fileExtension) {
        case '.pdf':
          return await this.extractTextFromPdf(filePath);
        case '.docx':
          return await this.extractTextFromDocx(filePath);
        case '.doc':
          // For .doc files, we might need to convert to .docx first
          this.logger.warn('DOC files are not fully supported. Consider converting to DOCX.');
          return await this.extractTextFromDocx(filePath);
        case '.txt':
          return await this.extractTextFromTxt(filePath);
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }
    } catch (error) {
      this.logger.error(`Failed to extract text from ${filePath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute Python script and return parsed result
   */
  private async executePythonScript(scriptPath: string, args: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonCommand = this.configService.get('PYTHON_COMMAND', 'python3.11');
      
      const process = spawn(pythonCommand, [scriptPath, ...args], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse Python script output: ${error.message}`));
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to execute Python script: ${error.message}`));
      });
    });
  }
}
