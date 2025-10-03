#!/usr/bin/env python3
"""
Advanced Document Worker
Processes documents using the advanced document processor
"""

import os
import sys
import json
import time
import logging
from typing import Dict, Any
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from advanced_document_processor import AdvancedDocumentProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class AdvancedDocumentWorker:
    """Worker for processing documents with advanced chunking"""
    
    def __init__(self):
        self.processor = AdvancedDocumentProcessor()
        logger.info("Advanced Document Worker initialized")
    
    def process_document_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a document job"""
        try:
            document_id = job_data.get('documentId')
            file_path = job_data.get('filePath')
            s3_key = job_data.get('s3Key')
            s3_bucket = job_data.get('s3Bucket')
            
            logger.info(f"Processing document {document_id} from {file_path}")
            
            # Process the document
            result = self.processor.process_document(file_path, document_id)
            
            if not result.success:
                logger.error(f"Failed to process document {document_id}: {result.error_message}")
                return {
                    'success': False,
                    'documentId': document_id,
                    'error': result.error_message
                }
            
            # Prepare chunks for database storage
            chunks_data = []
            for chunk in result.chunks:
                chunk_data = {
                    'chunkId': chunk['chunk_id'],
                    'documentId': document_id,
                    'content': chunk['content'],
                    'metadata': chunk['metadata'],
                    'createdAt': time.time(),
                    'updatedAt': time.time()
                }
                chunks_data.append(chunk_data)
            
            # Return processing result
            return {
                'success': True,
                'documentId': document_id,
                'title': result.title,
                'content': result.content,
                'chunks': chunks_data,
                'metadata': result.metadata,
                'processingTime': result.processing_time,
                'chunkCount': len(chunks_data)
            }
            
        except Exception as e:
            logger.error(f"Error processing document job: {e}")
            return {
                'success': False,
                'documentId': job_data.get('documentId', 'unknown'),
                'error': str(e)
            }

def main():
    """Main function for processing a single document"""
    if len(sys.argv) < 2:
        print("Usage: python advanced-document-worker.py <job_data_json>")
        sys.exit(1)
    
    try:
        # Parse job data from command line argument
        job_data = json.loads(sys.argv[1])
        
        # Create worker and process job
        worker = AdvancedDocumentWorker()
        result = worker.process_document_job(job_data)
        
        # Output result as JSON
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        logger.error(f"Error in main: {e}")
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
