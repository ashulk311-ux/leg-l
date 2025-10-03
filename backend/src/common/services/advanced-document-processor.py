#!/usr/bin/env python3
"""
Advanced Document Processor with Intelligent Chunking
Uses state-of-the-art NLP techniques for optimal document processing
"""

import os
import sys
import json
import logging
import hashlib
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path

# PDF Processing
import PyPDF2
import pdfplumber
import fitz  # PyMuPDF

# Document Processing
from docx import Document
import lxml.etree as ET

# NLP Libraries
import nltk
import spacy
from transformers import AutoTokenizer, AutoModel
import torch
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter, SpacyTextSplitter
from langchain.schema import Document as LangchainDocument

# Data Processing
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ChunkMetadata:
    """Metadata for a document chunk"""
    chunk_id: str
    document_id: str
    chunk_index: int
    start_char: int
    end_char: int
    word_count: int
    sentence_count: int
    paragraph_count: int
    section_title: Optional[str] = None
    chunk_type: str = "text"  # text, table, figure, header, etc.
    confidence_score: float = 1.0
    semantic_embedding: Optional[List[float]] = None
    keywords: List[str] = None
    entities: List[Dict[str, Any]] = None

@dataclass
class ProcessingResult:
    """Result of document processing"""
    document_id: str
    title: str
    content: str
    chunks: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    processing_time: float
    success: bool
    error_message: Optional[str] = None

class AdvancedDocumentProcessor:
    """Advanced document processor with intelligent chunking capabilities"""
    
    def __init__(self):
        self.nlp = None
        self.sentence_model = None
        self.tokenizer = None
        self.model = None
        self.text_splitter = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize NLP models and text splitters"""
        try:
            # Initialize spaCy model
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                logger.warning("spaCy model not found, downloading...")
                os.system("python -m spacy download en_core_web_sm")
                self.nlp = spacy.load("en_core_web_sm")
            
            # Initialize sentence transformer for embeddings
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Initialize text splitter
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            
            logger.info("All models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing models: {e}")
            raise
    
    def process_document(self, file_path: str, document_id: str) -> ProcessingResult:
        """Process a document and create intelligent chunks"""
        start_time = time.time()
        
        try:
            # Extract text based on file type
            content, metadata = self._extract_content(file_path)
            
            if not content.strip():
                return ProcessingResult(
                    document_id=document_id,
                    title=metadata.get('title', 'Unknown'),
                    content=content,
                    chunks=[],
                    metadata=metadata,
                    processing_time=time.time() - start_time,
                    success=False,
                    error_message="No content extracted from document"
                )
            
            # Create intelligent chunks
            chunks = self._create_intelligent_chunks(content, document_id, metadata)
            
            return ProcessingResult(
                document_id=document_id,
                title=metadata.get('title', 'Unknown'),
                content=content,
                chunks=chunks,
                metadata=metadata,
                processing_time=time.time() - start_time,
                success=True
            )
            
        except Exception as e:
            logger.error(f"Error processing document {document_id}: {e}")
            return ProcessingResult(
                document_id=document_id,
                title="Unknown",
                content="",
                chunks=[],
                metadata={},
                processing_time=time.time() - start_time,
                success=False,
                error_message=str(e)
            )
    
    def _extract_content(self, file_path: str) -> Tuple[str, Dict[str, Any]]:
        """Extract content from various document formats"""
        file_ext = Path(file_path).suffix.lower()
        
        if file_ext == '.pdf':
            return self._extract_pdf_content(file_path)
        elif file_ext in ['.docx', '.doc']:
            return self._extract_word_content(file_path)
        elif file_ext == '.txt':
            return self._extract_text_content(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
    
    def _extract_pdf_content(self, file_path: str) -> Tuple[str, Dict[str, Any]]:
        """Extract content from PDF using multiple methods"""
        content = ""
        metadata = {}
        
        try:
            # Method 1: pdfplumber (best for text extraction)
            with pdfplumber.open(file_path) as pdf:
                pages_text = []
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        pages_text.append(page_text)
                
                content = "\n\n".join(pages_text)
                metadata['page_count'] = len(pdf.pages)
                metadata['extraction_method'] = 'pdfplumber'
        
        except Exception as e:
            logger.warning(f"pdfplumber failed: {e}, trying PyMuPDF")
            
            try:
                # Method 2: PyMuPDF (fallback)
                doc = fitz.open(file_path)
                pages_text = []
                for page_num in range(doc.page_count):
                    page = doc[page_num]
                    page_text = page.get_text()
                    if page_text:
                        pages_text.append(page_text)
                
                content = "\n\n".join(pages_text)
                metadata['page_count'] = doc.page_count
                metadata['extraction_method'] = 'pymupdf'
                doc.close()
                
            except Exception as e2:
                logger.error(f"PyMuPDF also failed: {e2}")
                raise Exception(f"Failed to extract PDF content: {e2}")
        
        return content, metadata
    
    def _extract_word_content(self, file_path: str) -> Tuple[str, Dict[str, Any]]:
        """Extract content from Word documents"""
        try:
            doc = Document(file_path)
            paragraphs = []
            
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    paragraphs.append(paragraph.text)
            
            content = "\n\n".join(paragraphs)
            metadata = {
                'paragraph_count': len(paragraphs),
                'extraction_method': 'python-docx'
            }
            
            return content, metadata
            
        except Exception as e:
            logger.error(f"Error extracting Word content: {e}")
            raise
    
    def _extract_text_content(self, file_path: str) -> Tuple[str, Dict[str, Any]]:
        """Extract content from plain text files"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            metadata = {
                'extraction_method': 'plain_text'
            }
            
            return content, metadata
            
        except Exception as e:
            logger.error(f"Error extracting text content: {e}")
            raise
    
    def _create_intelligent_chunks(self, content: str, document_id: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create intelligent chunks using advanced NLP techniques"""
        chunks = []
        
        # Step 1: Basic text splitting
        basic_chunks = self.text_splitter.split_text(content)
        
        # Step 2: Enhance chunks with NLP analysis
        for i, chunk_text in enumerate(basic_chunks):
            if not chunk_text.strip():
                continue
            
            # Analyze chunk with spaCy
            doc = self.nlp(chunk_text)
            
            # Extract entities
            entities = []
            for ent in doc.ents:
                entities.append({
                    'text': ent.text,
                    'label': ent.label_,
                    'start': ent.start_char,
                    'end': ent.end_char
                })
            
            # Extract keywords (nouns and important terms)
            keywords = []
            for token in doc:
                if (token.pos_ in ['NOUN', 'PROPN'] and 
                    not token.is_stop and 
                    not token.is_punct and 
                    len(token.text) > 2):
                    keywords.append(token.lemma_.lower())
            
            # Remove duplicates and limit keywords
            keywords = list(set(keywords))[:10]
            
            # Generate semantic embedding
            embedding = self.sentence_model.encode(chunk_text).tolist()
            
            # Calculate chunk metadata
            chunk_metadata = ChunkMetadata(
                chunk_id=f"{document_id}_chunk_{i}",
                document_id=document_id,
                chunk_index=i,
                start_char=content.find(chunk_text),
                end_char=content.find(chunk_text) + len(chunk_text),
                word_count=len(chunk_text.split()),
                sentence_count=len(list(doc.sents)),
                paragraph_count=chunk_text.count('\n\n') + 1,
                keywords=keywords,
                entities=entities,
                semantic_embedding=embedding
            )
            
            # Create chunk data
            chunk_data = {
                'chunk_id': chunk_metadata.chunk_id,
                'document_id': document_id,
                'content': chunk_text,
                'metadata': {
                    'chunk_index': chunk_metadata.chunk_index,
                    'start_char': chunk_metadata.start_char,
                    'end_char': chunk_metadata.end_char,
                    'word_count': chunk_metadata.word_count,
                    'sentence_count': chunk_metadata.sentence_count,
                    'paragraph_count': chunk_metadata.paragraph_count,
                    'keywords': chunk_metadata.keywords,
                    'entities': chunk_metadata.entities,
                    'semantic_embedding': chunk_metadata.semantic_embedding,
                    'chunk_type': chunk_metadata.chunk_type,
                    'confidence_score': chunk_metadata.confidence_score
                }
            }
            
            chunks.append(chunk_data)
        
        # Step 3: Optimize chunks using semantic similarity
        optimized_chunks = self._optimize_chunks_semantically(chunks)
        
        return optimized_chunks
    
    def _optimize_chunks_semantically(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Optimize chunks based on semantic similarity"""
        if len(chunks) <= 1:
            return chunks
        
        # Extract embeddings
        embeddings = [chunk['metadata']['semantic_embedding'] for chunk in chunks]
        embeddings_matrix = np.array(embeddings)
        
        # Calculate similarity matrix
        similarity_matrix = cosine_similarity(embeddings_matrix)
        
        # Find chunks that are too similar and merge them
        optimized_chunks = []
        used_indices = set()
        
        for i, chunk in enumerate(chunks):
            if i in used_indices:
                continue
            
            # Find similar chunks
            similar_chunks = [i]
            for j in range(i + 1, len(chunks)):
                if j not in used_indices and similarity_matrix[i][j] > 0.8:
                    similar_chunks.append(j)
                    used_indices.add(j)
            
            if len(similar_chunks) > 1:
                # Merge similar chunks
                merged_content = " ".join([chunks[idx]['content'] for idx in similar_chunks])
                merged_metadata = chunks[similar_chunks[0]]['metadata'].copy()
                merged_metadata['merged_from'] = [chunks[idx]['chunk_id'] for idx in similar_chunks]
                
                optimized_chunk = {
                    'chunk_id': f"{chunks[similar_chunks[0]]['document_id']}_merged_{i}",
                    'document_id': chunks[similar_chunks[0]]['document_id'],
                    'content': merged_content,
                    'metadata': merged_metadata
                }
                optimized_chunks.append(optimized_chunk)
            else:
                optimized_chunks.append(chunk)
        
        return optimized_chunks
    
    def get_chunk_similarity(self, chunk1: Dict[str, Any], chunk2: Dict[str, Any]) -> float:
        """Calculate semantic similarity between two chunks"""
        if not chunk1['metadata'].get('semantic_embedding') or not chunk2['metadata'].get('semantic_embedding'):
            return 0.0
        
        embedding1 = np.array(chunk1['metadata']['semantic_embedding']).reshape(1, -1)
        embedding2 = np.array(chunk2['metadata']['semantic_embedding']).reshape(1, -1)
        
        return cosine_similarity(embedding1, embedding2)[0][0]
    
    def search_similar_chunks(self, query: str, chunks: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        """Find chunks similar to a query"""
        if not chunks:
            return []
        
        # Encode query
        query_embedding = self.sentence_model.encode(query)
        
        # Calculate similarities
        similarities = []
        for chunk in chunks:
            if chunk['metadata'].get('semantic_embedding'):
                chunk_embedding = np.array(chunk['metadata']['semantic_embedding'])
                similarity = cosine_similarity([query_embedding], [chunk_embedding])[0][0]
                similarities.append((similarity, chunk))
        
        # Sort by similarity and return top_k
        similarities.sort(key=lambda x: x[0], reverse=True)
        return [chunk for _, chunk in similarities[:top_k]]

def main():
    """Main function for testing the processor"""
    if len(sys.argv) != 3:
        print("Usage: python advanced-document-processor.py <file_path> <document_id>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    document_id = sys.argv[2]
    
    processor = AdvancedDocumentProcessor()
    result = processor.process_document(file_path, document_id)
    
    print(json.dumps({
        'success': result.success,
        'document_id': result.document_id,
        'title': result.title,
        'chunk_count': len(result.chunks),
        'processing_time': result.processing_time,
        'error_message': result.error_message
    }, indent=2))

if __name__ == "__main__":
    import time
    main()
