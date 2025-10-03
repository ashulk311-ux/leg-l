import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class PythonFilesChecker {
  private static readonly logger = new Logger(PythonFilesChecker.name);

  static checkPythonFiles(): void {
    // Use process.cwd() to get the actual project root
    const projectRoot = process.cwd();
    const distPath = path.join(projectRoot, 'dist');
    const pythonFiles = [
      'python-document-processor.py',
      'advanced_document_processor.py'
    ];

    let missingFiles: string[] = [];

    for (const file of pythonFiles) {
      const filePath = path.join(distPath, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      this.logger.warn(`Missing Python files: ${missingFiles.join(', ')}`);
      this.logger.warn('Attempting to copy Python files from source...');
      
      try {
        const sourcePath = path.join(projectRoot, 'src/common/services');
        for (const file of missingFiles) {
          const sourceFile = path.join(sourcePath, file);
          const destFile = path.join(distPath, file);
          
          if (fs.existsSync(sourceFile)) {
            fs.copyFileSync(sourceFile, destFile);
            fs.chmodSync(destFile, 0o755);
            this.logger.log(`Copied ${file} to dist folder`);
          } else {
            this.logger.error(`Source file not found: ${sourceFile}`);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to copy Python files: ${error.message}`);
      }
    } else {
      this.logger.log('All Python files are present in dist folder');
    }
  }
}
