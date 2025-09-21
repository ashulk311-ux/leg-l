import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { aiService } from '../../services/ai';
import { Document, QARequest } from '@shared/types';

interface DocumentQAProps {
  document?: Document;
  documentId?: string;
  documentIds?: string[];
  onAnswerGenerated?: (answer: string) => void;
}

interface QAResponse {
  question: string;
  answer: string;
  sources: Array<{
    documentId: string;
    title: string;
    text: string;
    pageNumbers: number[];
    score: number;
  }>;
  confidence: number;
  processingTime: number;
  model: string;
  relatedQuestions: string[];
}

export function DocumentQA({ 
  document, 
  documentId, 
  documentIds, 
  onAnswerGenerated 
}: DocumentQAProps) {
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<QAResponse[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const qaMutation = useMutation({
    mutationFn: async (request: QARequest) => {
      return await aiService.answerQuestion(request);
    },
    onSuccess: (response) => {
      const qaResponse: QAResponse = {
        question,
        answer: response.answer,
        sources: response.sources,
        confidence: response.confidence,
        processingTime: response.processingTime,
        model: response.model,
        relatedQuestions: response.relatedQuestions || [],
      };
      
      setQaHistory(prev => [qaResponse, ...prev]);
      onAnswerGenerated?.(response.answer);
      setQuestion('');
      toast.success('Question answered successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to answer question');
    },
  });

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const targetDocumentIds = documentIds || (documentId ? [documentId] : []);
    if (targetDocumentIds.length === 0) {
      toast.error('No documents selected for Q&A');
      return;
    }

    setIsGenerating(true);
    
    try {
      const request: QARequest = {
        question: question.trim(),
        documentIds: targetDocumentIds,
        includeSources: true,
      };

      await qaMutation.mutateAsync(request);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRelatedQuestion = (relatedQuestion: string) => {
    setQuestion(relatedQuestion);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const suggestedQuestions = [
    "What are the main legal issues discussed in this document?",
    "What are the key terms and conditions?",
    "What are the potential risks or liabilities mentioned?",
    "What are the important deadlines or timeframes?",
    "What are the parties' obligations and responsibilities?",
    "What are the dispute resolution mechanisms?",
    "What are the key legal precedents or cases cited?",
    "What are the regulatory requirements mentioned?",
  ];

  return (
    <div className="space-y-6">
      {/* Q&A Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-600" />
            <span>Document Q&A</span>
          </CardTitle>
          <CardDescription>
            Ask questions about your legal documents and get AI-powered answers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Selection */}
          {document && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900">{document.title}</h4>
                  <p className="text-sm text-gray-500">{document.filename}</p>
                </div>
              </div>
            </div>
          )}

          {/* Question Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ask a Question
              </label>
              <div className="relative">
                <QuestionMarkCircleIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to know about this document?"
                  className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  rows={3}
                />
                <Button
                  className="absolute right-2 top-2"
                  size="sm"
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    'Ask'
                  )}
                </Button>
              </div>
            </div>

            {/* Suggested Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggested Questions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuestion(suggestion)}
                    className="text-left p-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Q&A History */}
      {qaHistory.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Q&A History</h3>
          
          {qaHistory.map((qa, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                {/* Question */}
                <div className="mb-4">
                  <div className="flex items-start space-x-3">
                    <QuestionMarkCircleIcon className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{qa.question}</h4>
                    </div>
                  </div>
                </div>

                {/* Answer */}
                <div className="mb-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {qa.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confidence and Processing Time */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(qa.confidence)}`}>
                      {getConfidenceLabel(qa.confidence)} ({Math.round(qa.confidence * 100)}%)
                    </span>
                    <span className="text-gray-500">
                      <ClockIcon className="h-4 w-4 inline mr-1" />
                      {qa.processingTime}ms
                    </span>
                  </div>
                  <span className="text-gray-500">Model: {qa.model}</span>
                </div>

                {/* Sources */}
                {qa.sources && qa.sources.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <PaperClipIcon className="h-4 w-4 mr-1" />
                      Sources ({qa.sources.length})
                    </h5>
                    <div className="space-y-2">
                      {qa.sources.map((source, sourceIndex) => (
                        <div key={sourceIndex} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-gray-900">
                              {source.title}
                            </span>
                            <span className="text-xs text-gray-500">
                              Score: {Math.round(source.score * 100)}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {source.text}
                          </p>
                          {source.pageNumbers && source.pageNumbers.length > 0 && (
                            <div className="text-xs text-gray-500">
                              Pages: {source.pageNumbers.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Questions */}
                {qa.relatedQuestions && qa.relatedQuestions.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <LightBulbIcon className="h-4 w-4 mr-1" />
                      Related Questions
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {qa.relatedQuestions.map((relatedQ, relatedIndex) => (
                        <button
                          key={relatedIndex}
                          onClick={() => handleRelatedQuestion(relatedQ)}
                          className="px-3 py-1 text-sm text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-full transition-colors"
                        >
                          {relatedQ}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            <span>Q&A Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Be specific:</strong> Ask detailed questions about specific sections or concepts.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Use legal terminology:</strong> The AI understands legal concepts and terminology.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Ask follow-up questions:</strong> Use related questions to explore topics deeper.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Check sources:</strong> Review the source documents for complete context.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
