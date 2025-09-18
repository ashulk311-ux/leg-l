# Legal Document Management System

A comprehensive web application for managing, searching, and summarizing legal documents using AI-powered RAG (Retrieval-Augmented Generation) technology.

## 🏗️ Architecture

This is a monorepo containing:

- **Frontend**: React + Vite + Tailwind CSS (mobile-first design)
- **Backend**: NestJS API server with JWT authentication
- **Workers**: Python-based document processing pipeline
- **Shared**: Common types and utilities
- **Deployment**: Docker and Kubernetes configurations

## 🚀 Features

### Core Features
- **Document Upload**: Support for PDF, DOCX, TXT, and image formats
- **AI-Powered Search**: Semantic search using vector embeddings
- **Smart Summarization**: AI-generated document summaries
- **Question & Answer**: Interactive Q&A on document content
- **Mobile-First Design**: Responsive interface optimized for all devices

### Enterprise Features
- **Role-Based Access**: Admin and User roles with granular permissions
- **Audit Logging**: Comprehensive activity tracking
- **Security**: JWT authentication, encryption, and compliance features
- **Scalability**: Queue-based processing and horizontal scaling

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Query for state management
- React Router for navigation

### Backend
- NestJS with TypeScript
- MongoDB for data storage
- Redis for caching and queues
- JWT for authentication
- BullMQ for job processing

### Document Processing
- Python with FastAPI
- Celery for task queues
- Tesseract for OCR
- Sentence Transformers for embeddings
- FAISS/Milvus for vector storage

### Infrastructure
- Docker for containerization
- Kubernetes for orchestration
- AWS/GCP for cloud deployment
- Prometheus + Grafana for monitoring

## 📁 Project Structure

```
legal-doc-system/
├── frontend/                 # React application
├── backend/                  # NestJS API server
├── workers/                  # Python document processing
├── shared/                   # Shared types and utilities
├── deployment/               # Docker and K8s configs
├── docs/                     # Documentation
└── scripts/                  # Build and deployment scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB 5.0+
- Redis 6.0+
- Docker (optional)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd legal-doc-system
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   
   # Workers
   cd ../workers && pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start all services with Docker Compose
   docker-compose -f docker-compose.dev.yml up
   ```

## 📋 Development Phases

- **Phase 1**: Foundation & Architecture (Weeks 1-4)
- **Phase 2**: Core Backend Development (Weeks 5-12)
- **Phase 3**: Frontend Development (Weeks 13-20)
- **Phase 4**: Advanced Features (Weeks 21-26)
- **Phase 5**: Enterprise Features (Weeks 27-32)
- **Phase 6**: Testing & Deployment (Weeks 33-36)

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting and DDoS protection
- Encryption at rest and in transit
- Comprehensive audit logging

## 📊 Monitoring

- Application metrics with Prometheus
- Log aggregation with ELK stack
- Error tracking and alerting
- Performance monitoring
- User analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.
# leg-l
