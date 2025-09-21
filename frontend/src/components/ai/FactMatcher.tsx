import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { aiService } from '../../services/ai';
import { FactMatchingRequest } from '@shared/types';
import { Document } from '@shared/types';

interface FactMatcherProps {
  document?: Document;
  documentId?: string;
  documentIds?: string[];
  onFactsMatched?: (matches: any[]) => void;
}

interface FactMatch {
  fact: string;
  documentId: string;
  title: string;
  relevantChunks: Array<{
    chunkId: string;
    text: string;
    pageNumbers: number[];
    score: number;
  }>;
  overallScore: number;
}

export function FactMatcher({ 
  document, 
  documentId, 
  documentIds, 
  onFactsMatched 
}: FactMatcherProps) {
  const [facts, setFacts] = useState<string[]>(['']);
  const [matchingResults, setMatchingResults] = useState<FactMatch[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  const factMatchingMutation = useMutation({
    mutationFn: async (request: FactMatchingRequest) => {
      return await aiService.matchFacts(request);
    },
    onSuccess: (response) => {
      setMatchingResults(response.matches);
      onFactsMatched?.(response.matches);
      toast.success(`Found ${response.totalMatches} fact matches!`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to match facts');
    },
  });

  const handleFactChange = (index: number, value: string) => {
    const newFacts = [...facts];
    newFacts[index] = value;
    setFacts(newFacts);
  };

  const addFact = () => {
    setFacts([...facts, '']);
  };

  const removeFact = (index: number) => {
    if (facts.length > 1) {
      const newFacts = facts.filter((_, i) => i !== index);
      setFacts(newFacts);
    }
  };

  const handleMatchFacts = async () => {
    const validFacts = facts.filter(fact => fact.trim().length > 0);
    if (validFacts.length === 0) {
      toast.error('Please enter at least one fact to match');
      return;
    }

    const targetDocumentIds = documentIds || (documentId ? [documentId] : []);
    if (targetDocumentIds.length === 0) {
      toast.error('No documents selected for fact matching');
      return;
    }

    setIsMatching(true);
    
    try {
      const request: FactMatchingRequest = {
        facts: validFacts,
        documentIds: targetDocumentIds,
      };

      await factMatchingMutation.mutateAsync(request);
    } finally {
      setIsMatching(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'High Match';
    if (score >= 0.6) return 'Medium Match';
    return 'Low Match';
  };

  const getMatchIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    if (score >= 0.6) return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
    return <XCircleIcon className="h-5 w-5 text-red-600" />;
  };

  const sampleFacts = [
    "The contract includes a termination clause",
    "The agreement requires 30 days notice",
    "Intellectual property rights are retained by the company",
    "The contract is governed by California law",
    "Payment terms are net 30 days",
    "Confidentiality obligations extend for 2 years",
  ];

  return (
    <div className="space-y-6">
      {/* Fact Input Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-600" />
            <span>Fact Matching</span>
          </CardTitle>
          <CardDescription>
            Match specific facts against your legal documents
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

          {/* Facts Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Facts to Match
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={addFact}
                className="flex items-center space-x-1"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Fact</span>
              </Button>
            </div>

            <div className="space-y-3">
              {facts.map((fact, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <Input
                      value={fact}
                      onChange={(e) => handleFactChange(index, e.target.value)}
                      placeholder="Enter a fact to match against documents..."
                      className="w-full"
                    />
                  </div>
                  {facts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFact(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sample Facts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sample Facts
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sampleFacts.map((sampleFact, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const emptyIndex = facts.findIndex(f => f.trim() === '');
                    if (emptyIndex !== -1) {
                      handleFactChange(emptyIndex, sampleFact);
                    } else {
                      setFacts([...facts, sampleFact]);
                    }
                  }}
                  className="text-left p-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {sampleFact}
                </button>
              ))}
            </div>
          </div>

          {/* Match Button */}
          <Button
            onClick={handleMatchFacts}
            disabled={isMatching || facts.every(fact => fact.trim() === '')}
            className="w-full"
            loading={isMatching}
          >
            {isMatching ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Matching Facts...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Match Facts
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Matching Results */}
      {matchingResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Fact Matching Results ({matchingResults.length})
          </h3>
          
          {matchingResults.map((match, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                {/* Fact and Match Status */}
                <div className="mb-4">
                  <div className="flex items-start space-x-3">
                    {getMatchIcon(match.overallScore)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{match.fact}</h4>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(match.overallScore)}`}>
                          {getScoreLabel(match.overallScore)} ({Math.round(match.overallScore * 100)}%)
                        </span>
                        <span className="text-sm text-gray-500">
                          Found in: {match.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Relevant Chunks */}
                {match.relevantChunks && match.relevantChunks.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <PaperClipIcon className="h-4 w-4 mr-1" />
                      Supporting Evidence ({match.relevantChunks.length})
                    </h5>
                    <div className="space-y-3">
                      {match.relevantChunks.map((chunk, chunkIndex) => (
                        <div key={chunkIndex} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">
                              Chunk {chunkIndex + 1}
                            </span>
                            <span className="text-xs text-gray-500">
                              Score: {Math.round(chunk.score * 100)}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {chunk.text}
                          </p>
                          {chunk.pageNumbers && chunk.pageNumbers.length > 0 && (
                            <div className="text-xs text-gray-500">
                              Pages: {chunk.pageNumbers.join(', ')}
                            </div>
                          )}
                        </div>
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
            <span>Fact Matching Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Be specific:</strong> Use precise, factual statements rather than vague descriptions.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Use legal terminology:</strong> Include specific legal terms and concepts.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Check match scores:</strong> Higher scores indicate stronger evidence for the fact.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Review evidence:</strong> Examine the supporting chunks to verify the fact.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
