#!/usr/bin/env python3
"""
Advanced Document Processor for Legal Documents
Uses state-of-the-art NLP libraries for intelligent chunking and processing
"""

import os
import re
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd

# Core NLP libraries
import spacy
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Document processing
import PyPDF2
import pdfplumber
import fitz  # PyMuPDF
from docx import Document

# ML and embeddings
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModel
import torch

# LangChain for advanced text processing
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document as LangChainDocument

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
except:
    pass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ChunkMetadata:
    """Metadata for a document chunk"""
    chunk_id: str
    document_id: str
    content: str
    start_position: int
    end_position: int
    chunk_index: int
    entities: List[Dict[str, Any]]
    keywords: List[str]
    topics: List[str]
    sentiment: str
    importance_score: float
    legal_terms: List[str]
    case_references: List[str]
    statute_references: List[str]

class AdvancedDocumentProcessor:
    """Advanced document processor with intelligent chunking"""
    
    def __init__(self):
        """Initialize the processor with required models"""
        self._initialize_models()
        
    def _initialize_models(self):
        """Initialize all required models and processors"""
        try:
            # Initialize spaCy model
            self.nlp = spacy.load('en_core_web_sm')
            logger.info("✅ spaCy model loaded successfully")
            
            # Initialize sentence transformer
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("✅ Sentence transformer loaded successfully")
            
            # Initialize NLTK components
            self.lemmatizer = WordNetLemmatizer()
            self.stop_words = set(stopwords.words('english'))
            
            # Initialize text splitter
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""]
            )
            
            # Legal-specific patterns
            self.legal_patterns = {
                'case_reference': r'(?:Case No\.|Case Number|Docket No\.|Docket Number)\s*:?\s*([A-Z0-9\-/]+)',
                'statute_reference': r'(?:Section|§|Art\.|Article)\s+(\d+(?:\.\d+)*)',
                'court_reference': r'(?:Court|Judge|Justice)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
                'date_pattern': r'(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}',
                'legal_terms': r'\b(?:plaintiff|defendant|appellant|respondent|petitioner|respondent|court|judge|justice|attorney|counsel|lawyer|legal|statute|regulation|ordinance|amendment|clause|section|article|paragraph|subsection|provision|requirement|obligation|liability|damages|compensation|remedy|injunction|restraining order|temporary restraining order|preliminary injunction|permanent injunction|contempt|sanction|penalty|fine|sentence|conviction|acquittal|dismissal|summary judgment|default judgment|consent decree|settlement|mediation|arbitration|appeal|reversal|affirmance|remand|writ|habeas corpus|mandamus|prohibition|certiorari|stare decisis|precedent|binding precedent|persuasive precedent|dicta|holding|ratio decidendi|obiter dictum|per curiam|majority opinion|dissenting opinion|concurring opinion|plurality opinion|en banc|panel|bench|trial court|appellate court|supreme court|federal court|state court|district court|circuit court|bankruptcy court|tax court|family court|probate court|criminal court|civil court|administrative court|specialized court|tribunal|arbitration panel|mediation panel|settlement conference|pretrial conference|discovery|deposition|interrogatory|request for production|request for admission|subpoena|witness|expert witness|lay witness|character witness|fact witness|opinion witness|direct examination|cross examination|redirect examination|recross examination|objection|sustained|overruled|exception|preservation of error|harmless error|reversible error|plain error|fundamental error|structural error|trial error|procedural error|substantive error|constitutional error|statutory error|common law error|equitable error|remedial error|preventive error|corrective error|compensatory error|punitive error|exemplary error|nominal error|actual error|presumed error|inferred error|implied error|express error|explicit error|tacit error|silent error|unspoken error|unwritten error|customary error|traditional error|conventional error|standard error|normal error|typical error|usual error|common error|frequent error|regular error|ordinary error|everyday error|routine error|standard error|normal error|typical error|usual error|common error|frequent error|regular error|ordinary error|everyday error|routine error)\b'
            }
            
            logger.info("✅ All models initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Error initializing models: {e}")
            raise
    
    def process_document(self, content: str, filename: str, document_id: str = None) -> Dict[str, Any]:
        """
        Process a document with advanced NLP techniques
        
        Args:
            content: Document content as string
            filename: Original filename
            document_id: Optional document ID
            
        Returns:
            Dictionary containing processed chunks and metadata
        """
        try:
            logger.info(f"Processing document: {filename}")
            
            # Extract content and metadata
            extracted_content = self._extract_content(content, filename)
            
            # Create intelligent chunks
            chunks = self._create_intelligent_chunks(extracted_content, document_id or filename)
            
            # Generate embeddings for each chunk
            embeddings = self._generate_embeddings([chunk.content for chunk in chunks])
            
            # Extract metadata for each chunk
            for i, chunk in enumerate(chunks):
                chunk.entities = self._extract_entities(chunk.content)
                chunk.keywords = self._extract_keywords(chunk.content)
                chunk.legal_terms = self._extract_legal_terms(chunk.content)
                chunk.case_references = self._extract_case_references(chunk.content)
                chunk.statute_references = self._extract_statute_references(chunk.content)
                chunk.importance_score = self._calculate_importance_score(chunk.content)
                chunk.sentiment = self._analyze_sentiment(chunk.content)
            
            # Merge similar chunks
            merged_chunks = self._merge_chunks(chunks, embeddings)
            
            # Prepare response
            result = {
                'success': True,
                'document_id': document_id or filename,
                'filename': filename,
                'total_chunks': len(merged_chunks),
                'chunks': [
                    {
                        'chunk_id': chunk.chunk_id,
                        'content': chunk.content,
                        'start_position': chunk.start_position,
                        'end_position': chunk.end_position,
                        'chunk_index': chunk.chunk_index,
                        'entities': chunk.entities,
                        'keywords': chunk.keywords,
                        'legal_terms': chunk.legal_terms,
                        'case_references': chunk.case_references,
                        'statute_references': chunk.statute_references,
                        'importance_score': chunk.importance_score,
                        'sentiment': chunk.sentiment
                    }
                    for chunk in merged_chunks
                ],
                'processing_method': 'advanced',
                'advanced_metadata': {
                    'total_entities': sum(len(chunk.entities) for chunk in merged_chunks),
                    'total_legal_terms': sum(len(chunk.legal_terms) for chunk in merged_chunks),
                    'average_importance': np.mean([chunk.importance_score for chunk in merged_chunks]),
                    'processing_timestamp': pd.Timestamp.now().isoformat()
                }
            }
            
            logger.info(f"✅ Document processed successfully: {len(merged_chunks)} chunks created")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error processing document: {e}")
            return {
                'success': False,
                'error': str(e),
                'document_id': document_id or filename,
                'filename': filename
            }
    
    def _extract_content(self, content: str, filename: str) -> str:
        """Extract and clean content from various document formats"""
        try:
            # For now, assume content is already extracted
            # In a real implementation, this would handle PDF, DOCX, etc.
            return content.strip()
        except Exception as e:
            logger.error(f"Error extracting content: {e}")
            return content
    
    def _create_intelligent_chunks(self, content: str, document_id: str) -> List[ChunkMetadata]:
        """Create intelligent chunks using semantic understanding"""
        try:
            # Split into sentences first
            sentences = self._split_into_sentences(content)
            
            # Create initial chunks
            chunks = []
            current_chunk = ""
            chunk_start = 0
            chunk_index = 0
            
            for i, sentence in enumerate(sentences):
                # Check if adding this sentence would exceed optimal chunk size
                if len(current_chunk) + len(sentence) > 1000 and current_chunk:
                    # Create chunk from current content
                    chunk = ChunkMetadata(
                        chunk_id=f"{document_id}_chunk_{chunk_index}",
                        document_id=document_id,
                        content=current_chunk.strip(),
                        start_position=chunk_start,
                        end_position=chunk_start + len(current_chunk),
                        chunk_index=chunk_index,
                        entities=[],
                        keywords=[],
                        topics=[],
                        sentiment="",
                        importance_score=0.0,
                        legal_terms=[],
                        case_references=[],
                        statute_references=[]
                    )
                    chunks.append(chunk)
                    
                    # Start new chunk
                    current_chunk = sentence
                    chunk_start = chunk_start + len(current_chunk) - len(sentence)
                    chunk_index += 1
                else:
                    current_chunk += " " + sentence if current_chunk else sentence
            
            # Add the last chunk
            if current_chunk:
                chunk = ChunkMetadata(
                    chunk_id=f"{document_id}_chunk_{chunk_index}",
                    document_id=document_id,
                    content=current_chunk.strip(),
                    start_position=chunk_start,
                    end_position=chunk_start + len(current_chunk),
                    chunk_index=chunk_index,
                    entities=[],
                    keywords=[],
                    topics=[],
                    sentiment="",
                    importance_score=0.0,
                    legal_terms=[],
                    case_references=[],
                    statute_references=[]
                )
                chunks.append(chunk)
            
            return chunks
            
        except Exception as e:
            logger.error(f"Error creating chunks: {e}")
            # Fallback to simple chunking
            return self._create_simple_chunks(content, document_id)
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """Split text into sentences using spaCy"""
        try:
            doc = self.nlp(text)
            return [sent.text.strip() for sent in doc.sents if sent.text.strip()]
        except Exception as e:
            logger.error(f"Error splitting sentences: {e}")
            # Fallback to NLTK
            return sent_tokenize(text)
    
    def _extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract named entities using spaCy"""
        try:
            doc = self.nlp(text)
            entities = []
            for ent in doc.ents:
                entities.append({
                    'text': ent.text,
                    'label': ent.label_,
                    'start': ent.start_char,
                    'end': ent.end_char,
                    'description': spacy.explain(ent.label_)
                })
            return entities
        except Exception as e:
            logger.error(f"Error extracting entities: {e}")
            return []
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords using TF-IDF"""
        try:
            # Simple keyword extraction using TF-IDF
            vectorizer = TfidfVectorizer(
                max_features=10,
                stop_words='english',
                ngram_range=(1, 2)
            )
            
            # Fit and transform
            tfidf_matrix = vectorizer.fit_transform([text])
            feature_names = vectorizer.get_feature_names_out()
            
            # Get top keywords
            scores = tfidf_matrix.toarray()[0]
            keyword_scores = list(zip(feature_names, scores))
            keyword_scores.sort(key=lambda x: x[1], reverse=True)
            
            return [keyword for keyword, score in keyword_scores[:5] if score > 0]
            
        except Exception as e:
            logger.error(f"Error extracting keywords: {e}")
            return []
    
    def _extract_legal_terms(self, text: str) -> List[str]:
        """Extract legal terms using pattern matching"""
        try:
            legal_terms = []
            for match in re.finditer(self.legal_patterns['legal_terms'], text, re.IGNORECASE):
                legal_terms.append(match.group())
            return list(set(legal_terms))  # Remove duplicates
        except Exception as e:
            logger.error(f"Error extracting legal terms: {e}")
            return []
    
    def _extract_case_references(self, text: str) -> List[str]:
        """Extract case references"""
        try:
            case_refs = []
            for match in re.finditer(self.legal_patterns['case_reference'], text, re.IGNORECASE):
                case_refs.append(match.group(1))
            return case_refs
        except Exception as e:
            logger.error(f"Error extracting case references: {e}")
            return []
    
    def _extract_statute_references(self, text: str) -> List[str]:
        """Extract statute references"""
        try:
            statute_refs = []
            for match in re.finditer(self.legal_patterns['statute_reference'], text, re.IGNORECASE):
                statute_refs.append(match.group(1))
            return statute_refs
        except Exception as e:
            logger.error(f"Error extracting statute references: {e}")
            return []
    
    def _calculate_importance_score(self, text: str) -> float:
        """Calculate importance score based on legal terms and entities"""
        try:
            score = 0.0
            
            # Base score from legal terms
            legal_terms = self._extract_legal_terms(text)
            score += len(legal_terms) * 0.1
            
            # Score from entities
            entities = self._extract_entities(text)
            for entity in entities:
                if entity['label'] in ['PERSON', 'ORG', 'GPE', 'LAW']:
                    score += 0.05
            
            # Score from case/statute references
            case_refs = self._extract_case_references(text)
            statute_refs = self._extract_statute_references(text)
            score += len(case_refs) * 0.2
            score += len(statute_refs) * 0.15
            
            # Normalize score
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating importance score: {e}")
            return 0.0
    
    def _analyze_sentiment(self, text: str) -> str:
        """Analyze sentiment of the text"""
        try:
            # Simple sentiment analysis using spaCy
            doc = self.nlp(text)
            
            # Count positive and negative words
            positive_words = ['good', 'favorable', 'positive', 'beneficial', 'advantageous']
            negative_words = ['bad', 'negative', 'harmful', 'detrimental', 'adverse']
            
            pos_count = sum(1 for word in positive_words if word in text.lower())
            neg_count = sum(1 for word in negative_words if word in text.lower())
            
            if pos_count > neg_count:
                return 'positive'
            elif neg_count > pos_count:
                return 'negative'
            else:
                return 'neutral'
                
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return 'neutral'
    
    def _generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for texts"""
        try:
            embeddings = self.sentence_model.encode(texts)
            return embeddings
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            return np.array([])
    
    def _merge_chunks(self, chunks: List[ChunkMetadata], embeddings: np.ndarray) -> List[ChunkMetadata]:
        """Merge similar chunks based on semantic similarity"""
        try:
            if len(chunks) <= 1:
                return chunks
            
            # Calculate similarity matrix
            similarity_matrix = cosine_similarity(embeddings)
            
            # Find similar chunks
            merged_chunks = []
            used_indices = set()
            
            for i, chunk in enumerate(chunks):
                if i in used_indices:
                    continue
                
                # Find similar chunks
                similar_indices = []
                for j in range(i + 1, len(chunks)):
                    if j not in used_indices and similarity_matrix[i][j] > 0.8:
                        similar_indices.append(j)
                
                if similar_indices:
                    # Merge similar chunks
                    merged_content = chunk.content
                    merged_entities = chunk.entities.copy()
                    merged_keywords = chunk.keywords.copy()
                    merged_legal_terms = chunk.legal_terms.copy()
                    merged_case_refs = chunk.case_references.copy()
                    merged_statute_refs = chunk.statute_references.copy()
                    
                    for idx in similar_indices:
                        similar_chunk = chunks[idx]
                        merged_content += " " + similar_chunk.content
                        merged_entities.extend(similar_chunk.entities)
                        merged_keywords.extend(similar_chunk.keywords)
                        merged_legal_terms.extend(similar_chunk.legal_terms)
                        merged_case_refs.extend(similar_chunk.case_references)
                        merged_statute_refs.extend(similar_chunk.statute_references)
                        used_indices.add(idx)
                    
                    # Create merged chunk
                    merged_chunk = ChunkMetadata(
                        chunk_id=chunk.chunk_id,
                        document_id=chunk.document_id,
                        content=merged_content,
                        start_position=chunk.start_position,
                        end_position=chunks[similar_indices[-1]].end_position,
                        chunk_index=chunk.chunk_index,
                        entities=merged_entities,
                        keywords=list(set(merged_keywords)),
                        topics=chunk.topics,
                        sentiment=chunk.sentiment,
                        importance_score=max(chunk.importance_score, max(chunks[idx].importance_score for idx in similar_indices)),
                        legal_terms=list(set(merged_legal_terms)),
                        case_references=list(set(merged_case_refs)),
                        statute_references=list(set(merged_statute_refs))
                    )
                    merged_chunks.append(merged_chunk)
                else:
                    merged_chunks.append(chunk)
                
                used_indices.add(i)
            
            return merged_chunks
            
        except Exception as e:
            logger.error(f"Error merging chunks: {e}")
            return chunks
    
    def _create_simple_chunks(self, content: str, document_id: str) -> List[ChunkMetadata]:
        """Fallback simple chunking method"""
        try:
            chunks = []
            chunk_size = 1000
            overlap = 200
            
            for i in range(0, len(content), chunk_size - overlap):
                chunk_content = content[i:i + chunk_size]
                chunk = ChunkMetadata(
                    chunk_id=f"{document_id}_chunk_{i // (chunk_size - overlap)}",
                    document_id=document_id,
                    content=chunk_content,
                    start_position=i,
                    end_position=min(i + chunk_size, len(content)),
                    chunk_index=i // (chunk_size - overlap),
                    entities=[],
                    keywords=[],
                    topics=[],
                    sentiment="",
                    importance_score=0.0,
                    legal_terms=[],
                    case_references=[],
                    statute_references=[]
                )
                chunks.append(chunk)
            
            return chunks
            
        except Exception as e:
            logger.error(f"Error creating simple chunks: {e}")
            return []

if __name__ == "__main__":
    # Test the processor
    processor = AdvancedDocumentProcessor()
    
    test_text = """
    This is a test legal document. It contains various legal terms and references.
    The plaintiff filed a motion for summary judgment. The court granted the motion.
    Case Number: 2024-001. Section 123 of the statute applies.
    """
    
    result = processor.process_document(test_text, "test_document.txt", "test_doc_123")
    print(json.dumps(result, indent=2))
