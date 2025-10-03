#!/bin/bash

# Setup script for Python dependencies for Word document conversion

echo "Setting up Python dependencies for Word document conversion..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r backend/requirements.txt

# Make the Python script executable
chmod +x backend/src/common/services/python-word-converter.py

echo "Python dependencies installed successfully!"
echo ""
echo "To test the Word conversion:"
echo "python3 backend/src/common/services/python-word-converter.py --help"

