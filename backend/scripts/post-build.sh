#!/bin/bash

# Post-build script to ensure Python files are copied to dist folder
echo "Copying Python files to dist folder..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Copy Python files
cp src/common/services/python-document-processor.py dist/ 2>/dev/null || echo "Warning: python-document-processor.py not found"
cp src/common/services/advanced_document_processor.py dist/ 2>/dev/null || echo "Warning: advanced_document_processor.py not found"

# Make Python files executable
chmod +x dist/python-document-processor.py 2>/dev/null || true
chmod +x dist/advanced_document_processor.py 2>/dev/null || true

echo "Python files copied successfully!"
ls -la dist/ | grep -E "(python|advanced)" || echo "No Python files found in dist/"
