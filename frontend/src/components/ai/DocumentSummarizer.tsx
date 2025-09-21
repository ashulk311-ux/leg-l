import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  LightBulbIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { aiService } from '../../services/ai';
import { SummarizationRequest, SummaryLength } from '@shared/types';
import { Document } from '@shared/types';

interface DocumentSummarizerProps {
  document?: Document;
  documentId?: string;
  onSummaryGenerated?: (summary: string) => void;
}

export function DocumentSummarizer({ 
  document, 
  documentId, 
  onSummaryGenerated 
}: DocumentSummarizerProps) {
  const [summaryLength, setSummaryLength] = useState<SummaryLength | 'custom'>(SummaryLength.MEDIUM);
  const [customLength, setCustomLength] = useState(500);
  const [generatedSummary, setGeneratedSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const summarizationMutation = useMutation({
    mutationFn: async (request: SummarizationRequest) => {
      return await aiService.summarizeDocument(request);
    },
    onSuccess: (response) => {
      setGeneratedSummary(response.summary);
      onSummaryGenerated?.(response.summary);
      toast.success('Document summarized successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate summary');
    },
  });

  const handleSummarize = async () => {
    const targetDocumentId = documentId || document?._id;
    if (!targetDocumentId) {
      toast.error('No document selected for summarization');
      return;
    }

    setIsGenerating(true);
    
    try {
      const request: SummarizationRequest = {
        documentId: targetDocumentId,
        length: summaryLength === 'custom' ? SummaryLength.MEDIUM : summaryLength,
        includeCitations: true,
      };

      await summarizationMutation.mutateAsync(request);
    } finally {
      setIsGenerating(false);
    }
  };

  const getLengthDescription = (length: SummaryLength | 'custom') => {
    switch (length) {
      case SummaryLength.SHORT:
        return '1-2 paragraphs, key points only';
      case SummaryLength.MEDIUM:
        return '3-5 paragraphs, comprehensive overview';
      case SummaryLength.LONG:
        return 'Detailed summary with all major sections';
      case 'custom':
        return `Custom length: ${customLength} words`;
      default:
        return '';
    }
  };


  return (
    <div className="space-y-6">
      {/* Summary Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LightBulbIcon className="h-5 w-5 text-primary-600" />
            <span>Document Summarization</span>
          </CardTitle>
          <CardDescription>
            Generate AI-powered summaries of your legal documents
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

          {/* Summary Length Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Summary Length
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {([SummaryLength.SHORT, SummaryLength.MEDIUM, SummaryLength.LONG] as SummaryLength[]).map((length) => (
                  <button
                    key={length}
                    onClick={() => setSummaryLength(length)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      summaryLength === length
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium capitalize">{length}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getLengthDescription(length)}
                    </div>
                  </button>
                ))}
                
                <button
                  onClick={() => setSummaryLength('custom')}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    summaryLength === 'custom'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">Custom</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Specify word count
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Length Input */}
            {summaryLength === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Word Count
                </label>
                <input
                  type="number"
                  min="100"
                  max="2000"
                  value={customLength}
                  onChange={(e) => setCustomLength(parseInt(e.target.value) || 500)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter desired word count (100-2000 words)
                </p>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleSummarize}
            disabled={isGenerating || (!document && !documentId)}
            className="w-full"
            loading={isGenerating}
          >
            {isGenerating ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <LightBulbIcon className="h-4 w-4 mr-2" />
                Generate Summary
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Summary */}
      {generatedSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span>Generated Summary</span>
            </CardTitle>
            <CardDescription>
              AI-generated summary of the document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {generatedSummary}
                </p>
              </div>
            </div>

            {/* Summary Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  Copy Summary
                </Button>
                <Button variant="outline" size="sm">
                  Export as PDF
                </Button>
              </div>
              
              <div className="text-sm text-gray-500">
                {generatedSummary.split(' ').length} words
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            <span>Usage Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Short summaries</strong> are best for quick overviews and executive briefings.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Medium summaries</strong> provide a balanced overview with key details.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Long summaries</strong> include comprehensive details for thorough analysis.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Custom length</strong> allows you to specify exact word count requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
