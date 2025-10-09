import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentIcon,
  ClockIcon,
  StarIcon,
  TagIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { searchService, VectorSearchDto } from '../../services/search';
import { useSearchStore } from '../../stores/search';
import { formatDate } from '../../utils/format';
import { cn } from '../../utils/cn';

interface SemanticSearchProps {
  onResultSelect?: (result: any) => void;
  initialQuery?: string;
}

export function SemanticSearch({ onResultSelect, initialQuery = '' }: SemanticSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [filters, setFilters] = useState<VectorSearchDto['filters']>({
    categories: [],
    tags: [],
    jurisdictions: [],
    courts: [],
    years: [],
  });

  const {
    searchResults,
    setSearchResults,
    setSearchQuery: setStoreQuery,
    setFilters: setStoreFilters,
    addToHistory,
  } = useSearchStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['semantic-search', searchQuery, filters],
    queryFn: async () => {
      if (!searchQuery.trim()) return null;

      const searchDto: VectorSearchDto = {
        query: searchQuery,
        topK: 20,
        scoreThreshold: 0.7,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      };

      const response = await searchService.similaritySearch(searchDto);
      setSearchResults(response.results);
      addToHistory(searchQuery);
      
      return response;
    },
    enabled: !!searchQuery.trim(),
  });

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setStoreQuery(query);
    setStoreFilters(filters);
  };

  const handleFilterChange = (key: keyof NonNullable<VectorSearchDto['filters']>, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    setFilters(newFilters);
    setStoreFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      categories: [],
      tags: [],
      jurisdictions: [],
      courts: [],
      years: [],
    };
    setFilters(clearedFilters);
    setStoreFilters(clearedFilters);
  };

  const handleResultClick = (result: any) => {
    onResultSelect?.(result);
  };

  const getRelevanceScore = (score: number) => {
    if (score >= 0.9) return { label: 'Very High', color: 'text-green-600 bg-green-100' };
    if (score >= 0.8) return { label: 'High', color: 'text-blue-600 bg-blue-100' };
    if (score >= 0.7) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Low', color: 'text-gray-600 bg-gray-100' };
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Semantic Search</CardTitle>
          <CardDescription>
            Find relevant legal documents using natural language queries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for legal concepts, cases, or documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="pl-10 pr-20"
            />
            <Button
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              size="sm"
              onClick={() => handleSearch(searchQuery)}
              disabled={!searchQuery.trim() || isLoading}
            >
              {isLoading ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>

          {/* Search Suggestions */}
          {searchQuery && !data && (
            <div className="text-sm text-gray-500">
              <p>Try searching for:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>"contract disputes"</li>
                <li>"intellectual property cases"</li>
                <li>"employment law violations"</li>
                <li>"patent infringement"</li>
              </ul>
            </div>
          )}

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="h-3 w-3" />
              <span>Advanced Filters</span>
            </Button>

            {searchQuery && (
              <div className="text-sm text-gray-500">
                {data?.total || 0} results found
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Category
                  </label>
                  <select
                    multiple
                    value={filters.categories || []}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      handleFilterChange('categories', values);
                    }}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="contract">Contract</option>
                    <option value="case-law">Case Law</option>
                    <option value="statute">Statute</option>
                    <option value="regulation">Regulation</option>
                    <option value="brief">Brief</option>
                    <option value="memo">Memo</option>
                  </select>
                </div>

                {/* Jurisdiction Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jurisdiction
                  </label>
                  <Input
                    placeholder="e.g., California, Federal"
                    value={filters.jurisdictions?.[0] || ''}
                    onChange={(e) => handleFilterChange('jurisdictions', e.target.value ? [e.target.value] : [])}
                  />
                </div>

                {/* Court Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Court
                  </label>
                  <Input
                    placeholder="e.g., Supreme Court"
                    value={filters.courts?.[0] || ''}
                    onChange={(e) => handleFilterChange('courts', e.target.value ? [e.target.value] : [])}
                  />
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 2024"
                    value={filters.years?.[0] || ''}
                    onChange={(e) => {
                      const year = e.target.value ? parseInt(e.target.value) : undefined;
                      handleFilterChange('years', year ? [year] : []);
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button onClick={() => handleSearch(searchQuery)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ArrowPathIcon className="mx-auto h-8 w-8 text-primary-600 animate-spin mb-4" />
              <p className="text-gray-600">Searching for relevant documents...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">Search failed. Please try again.</p>
              <Button onClick={() => refetch()}>Retry Search</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {data && data.results.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MagnifyingGlassIcon className="mx-auto h-8 w-8 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {data && data.results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({data.total})
            </h3>
            <div className="text-sm text-gray-500">
              Sorted by relevance
            </div>
          </div>

          <div className="space-y-4">
            {data.results.map((result, index) => {
              const relevance = getRelevanceScore(result.score);
              
              return (
                <Card 
                  key={`${result.documentId}-${result.chunkId}`}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleResultClick(result)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <DocumentIcon className="h-5 w-5 text-gray-400" />
                          <h4 className="font-semibold text-gray-900">{result.title}</h4>
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', relevance.color)}>
                            {relevance.label} ({Math.round(result.score * 100)}%)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center space-x-1">
                            <TagIcon className="h-3 w-3" />
                            <span className="capitalize">{result.category}</span>
                          </span>
                          
                          {result.jurisdiction && (
                            <span className="flex items-center space-x-1">
                              <BuildingOfficeIcon className="h-3 w-3" />
                              <span>{result.jurisdiction}</span>
                            </span>
                          )}
                          
                          <span className="flex items-center space-x-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDate(result.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Highlighted Text */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">
                        {highlightText(result.text, searchQuery)}
                      </p>
                    </div>

                    {/* Tags */}
                    {result.tags && result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {result.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Page Numbers */}
                    {result.pageNumbers && result.pageNumbers.length > 0 && (
                      <div className="mt-3 text-sm text-gray-500">
                        <span className="font-medium">Pages:</span> {result.pageNumbers.join(', ')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Search History */}
      {recentSearches.length > 0 && !searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4" />
              <span>Recent Searches</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
