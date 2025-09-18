import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { 
  VectorSearchDto, 
  VectorSearchResult, 
  VectorSearchResponse,
  VECTOR_STORE_TYPES 
} from '@legal-docs/shared';

export interface VectorStoreConfig {
  type: 'milvus' | 'weaviate' | 'pinecone' | 'faiss';
  host?: string;
  port?: number;
  collectionName?: string;
  dimension?: number;
  apiKey?: string;
  endpoint?: string;
}

export interface VectorDocument {
  id: string;
  vector: number[];
  metadata: {
    chunkId: string;
    documentId: string;
    text: string;
    title: string;
    category: string;
    tags: string[];
    pageNumbers: number[];
    createdAt: Date;
  };
}

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);
  private milvusClient: MilvusClient;
  private config: VectorStoreConfig;
  private collectionName: string;

  constructor(private readonly configService: ConfigService) {
    this.initializeVectorStore();
  }

  private async initializeVectorStore() {
    const vectorStoreType = this.configService.get<string>('VECTOR_STORE_TYPE', 'milvus');
    
    this.config = {
      type: vectorStoreType as any,
      host: this.configService.get<string>('MILVUS_HOST', 'localhost'),
      port: this.configService.get<number>('MILVUS_PORT', 19530),
      collectionName: this.configService.get<string>('MILVUS_COLLECTION_NAME', 'legal_documents'),
      dimension: this.configService.get<number>('EMBEDDING_DIMENSION', 768),
    };

    this.collectionName = this.config.collectionName!;

    if (this.config.type === 'milvus') {
      await this.initializeMilvus();
    } else {
      this.logger.warn(`Vector store type '${this.config.type}' not implemented yet`);
    }
  }

  private async initializeMilvus() {
    try {
      this.milvusClient = new MilvusClient({
        address: `${this.config.host}:${this.config.port}`,
      });

      // Test connection
      await this.milvusClient.checkHealth();
      this.logger.log('Connected to Milvus vector database');

      // Create collection if it doesn't exist
      await this.ensureCollectionExists();
      
    } catch (error) {
      this.logger.error(`Failed to connect to Milvus: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to connect to vector database');
    }
  }

  private async ensureCollectionExists() {
    try {
      const hasCollection = await this.milvusClient.hasCollection({
        collection_name: this.collectionName,
      });

      if (!hasCollection) {
        await this.createCollection();
        this.logger.log(`Created collection '${this.collectionName}'`);
      } else {
        this.logger.log(`Collection '${this.collectionName}' already exists`);
      }
    } catch (error) {
      this.logger.error(`Failed to ensure collection exists: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async createCollection() {
    const collectionSchema = {
      collection_name: this.collectionName,
      description: 'Legal document chunks with embeddings',
      fields: [
        {
          name: 'id',
          data_type: 'VarChar',
          is_primary_key: true,
          max_length: 100,
        },
        {
          name: 'chunk_id',
          data_type: 'VarChar',
          max_length: 100,
        },
        {
          name: 'document_id',
          data_type: 'VarChar',
          max_length: 100,
        },
        {
          name: 'text',
          data_type: 'VarChar',
          max_length: 10000,
        },
        {
          name: 'title',
          data_type: 'VarChar',
          max_length: 500,
        },
        {
          name: 'category',
          data_type: 'VarChar',
          max_length: 100,
        },
        {
          name: 'tags',
          data_type: 'VarChar',
          max_length: 1000,
        },
        {
          name: 'page_numbers',
          data_type: 'VarChar',
          max_length: 500,
        },
        {
          name: 'created_at',
          data_type: 'Int64',
        },
        {
          name: 'vector',
          data_type: 'FloatVector',
          dim: this.config.dimension!,
        },
      ],
    };

    await this.milvusClient.createCollection(collectionSchema);

    // Create index for vector field
    await this.milvusClient.createIndex({
      collection_name: this.collectionName,
      field_name: 'vector',
      index_type: 'IVF_FLAT',
      metric_type: 'L2',
      params: { nlist: 1024 },
    });

    // Load collection
    await this.milvusClient.loadCollection({
      collection_name: this.collectionName,
    });
  }

  async insertVectors(documents: VectorDocument[]): Promise<void> {
    if (this.config.type !== 'milvus') {
      throw new BadRequestException(`Vector store type '${this.config.type}' not supported for insertion`);
    }

    try {
      this.logger.log(`Inserting ${documents.length} vectors into collection '${this.collectionName}'`);

      const data = documents.map(doc => ({
        id: doc.id,
        chunk_id: doc.metadata.chunkId,
        document_id: doc.metadata.documentId,
        text: doc.metadata.text,
        title: doc.metadata.title,
        category: doc.metadata.category,
        tags: JSON.stringify(doc.metadata.tags),
        page_numbers: JSON.stringify(doc.metadata.pageNumbers),
        created_at: doc.metadata.createdAt.getTime(),
        vector: doc.vector,
      }));

      await this.milvusClient.insert({
        collection_name: this.collectionName,
        data,
      });

      this.logger.log(`Successfully inserted ${documents.length} vectors`);
    } catch (error) {
      this.logger.error(`Failed to insert vectors: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to insert vectors');
    }
  }

  async searchVectors(searchDto: VectorSearchDto): Promise<VectorSearchResponse> {
    if (this.config.type !== 'milvus') {
      throw new BadRequestException(`Vector store type '${this.config.type}' not supported for search`);
    }

    try {
      const startTime = Date.now();
      const topK = searchDto.topK || 10;
      const scoreThreshold = searchDto.scoreThreshold || 0.7;

      this.logger.log(`Searching vectors with query: "${searchDto.query}"`);

      // Use provided query embedding or generate one
      const queryVector = searchDto.queryEmbedding || this.generateMockQueryEmbedding(searchDto.query);

      const searchParams = {
        collection_name: this.collectionName,
        vector: queryVector,
        limit: topK,
        output_fields: ['chunk_id', 'document_id', 'text', 'title', 'category', 'tags', 'page_numbers'],
        search_params: {
          metric_type: 'L2',
          params: { nprobe: 10 },
        },
      };

      // Add filters if provided
      if (searchDto.filters) {
        const filterExpressions = this.buildFilterExpressions(searchDto.filters);
        if (filterExpressions.length > 0) {
          searchParams['expr'] = filterExpressions.join(' and ');
        }
      }

      const searchResult = await this.milvusClient.search(searchParams);

      const results: VectorSearchResult[] = searchResult.results.map((result: any) => ({
        chunkId: result.entity.chunk_id,
        documentId: result.entity.document_id,
        score: 1 - result.score, // Convert L2 distance to similarity score
        chunkText: result.entity.text,
        metadata: {
          title: result.entity.title,
          pageNumbers: JSON.parse(result.entity.page_numbers || '[]'),
          category: result.entity.category,
          tags: JSON.parse(result.entity.tags || '[]'),
        },
      }));

      // Filter by score threshold
      const filteredResults = results.filter(result => result.score >= scoreThreshold);

      const processingTime = Date.now() - startTime;

      this.logger.log(`Found ${filteredResults.length} results in ${processingTime}ms`);

      return {
        results: filteredResults,
        total: filteredResults.length,
        query: searchDto.query,
        processingTime,
      };
    } catch (error) {
      this.logger.error(`Failed to search vectors: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to search vectors');
    }
  }

  async deleteVectors(chunkIds: string[]): Promise<void> {
    if (this.config.type !== 'milvus') {
      throw new BadRequestException(`Vector store type '${this.config.type}' not supported for deletion`);
    }

    try {
      this.logger.log(`Deleting ${chunkIds.length} vectors`);

      const expr = `chunk_id in [${chunkIds.map(id => `"${id}"`).join(', ')}]`;

      await this.milvusClient.deleteEntities({
        collection_name: this.collectionName,
        expr,
      });

      this.logger.log(`Successfully deleted ${chunkIds.length} vectors`);
    } catch (error) {
      this.logger.error(`Failed to delete vectors: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete vectors');
    }
  }

  async getCollectionStats(): Promise<any> {
    if (this.config.type !== 'milvus') {
      throw new BadRequestException(`Vector store type '${this.config.type}' not supported for stats`);
    }

    try {
      const stats = await this.milvusClient.getCollectionStatistics({
        collection_name: this.collectionName,
      });

      return {
        collectionName: this.collectionName,
        totalVectors: stats.data.row_count,
        dimension: this.config.dimension,
        type: this.config.type,
      };
    } catch (error) {
      this.logger.error(`Failed to get collection stats: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to get collection statistics');
    }
  }

  private generateMockQueryEmbedding(query: string): number[] {
    // This is a placeholder - in reality, you'd use the embedding service
    const embedding = new Array(this.config.dimension!);
    const hash = this.simpleHash(query);
    
    for (let i = 0; i < this.config.dimension!; i++) {
      embedding[i] = Math.sin(hash + i) * 0.1;
    }
    
    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private buildFilterExpressions(filters: any): string[] {
    const expressions: string[] = [];

    if (filters.categories && filters.categories.length > 0) {
      const categoryExpr = `category in [${filters.categories.map((cat: string) => `"${cat}"`).join(', ')}]`;
      expressions.push(categoryExpr);
    }

    if (filters.tags && filters.tags.length > 0) {
      const tagExpr = filters.tags.map((tag: string) => `tags like "%${tag}%"`).join(' or ');
      expressions.push(`(${tagExpr})`);
    }

    if (filters.jurisdictions && filters.jurisdictions.length > 0) {
      const jurisdictionExpr = filters.jurisdictions.map((jur: string) => `title like "%${jur}%"`).join(' or ');
      expressions.push(`(${jurisdictionExpr})`);
    }

    if (filters.courts && filters.courts.length > 0) {
      const courtExpr = filters.courts.map((court: string) => `title like "%${court}%"`).join(' or ');
      expressions.push(`(${courtExpr})`);
    }

    if (filters.years && filters.years.length > 0) {
      const yearExpr = filters.years.map((year: number) => `title like "%${year}%"`).join(' or ');
      expressions.push(`(${yearExpr})`);
    }

    return expressions;
  }
}
