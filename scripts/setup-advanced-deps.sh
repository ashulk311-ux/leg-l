#!/bin/bash

# Setup script for advanced Python dependencies
# This script installs all the required Python packages for advanced document processing

echo "Setting up advanced Python dependencies for document processing..."

# Update pip
pip install --upgrade pip

# Install basic dependencies first
pip install python-docx==1.1.0
pip install lxml==4.9.3

# Install PDF processing libraries
pip install PyPDF2==3.0.1
pip install pdfplumber==0.10.3
pip install pymupdf==1.23.8

# Install NLP libraries
pip install nltk==3.8.1
pip install spacy==3.7.2

# Download spaCy model
python -m spacy download en_core_web_sm

# Install ML libraries
pip install transformers==4.35.2
pip install torch==2.1.1
pip install sentence-transformers==2.2.2

# Install LangChain
pip install langchain==0.0.350
pip install langchain-community==0.0.10
pip install tiktoken==0.5.1

# Install data processing libraries
pip install numpy==1.24.3
pip install scikit-learn==1.3.2
pip install pandas==2.1.4

echo "Advanced Python dependencies installed successfully!"
echo "You can now use the advanced document processing features."
