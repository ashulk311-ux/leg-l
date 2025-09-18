import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { DocumentSummarizer } from '../components/ai/DocumentSummarizer';
import { DocumentQA } from '../components/ai/DocumentQA';
import { FactMatcher } from '../components/ai/FactMatcher';

export function AIPage() {
  const [activeTab, setActiveTab] = useState<'summarize' | 'qa' | 'facts'>('summarize');

  const tabs = [
    { id: 'summarize', label: 'Summarization', description: 'Generate document summaries' },
    { id: 'qa', label: 'Q&A', description: 'Ask questions about documents' },
    { id: 'facts', label: 'Fact Matching', description: 'Match facts against documents' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Features</h1>
          <p className="text-gray-600 mt-2">Leverage AI to analyze and understand your legal documents</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'summarize' && <DocumentSummarizer />}
        {activeTab === 'qa' && <DocumentQA />}
        {activeTab === 'facts' && <FactMatcher />}
      </div>
    </div>
  );
}
