import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "./supabase";

// Initialize Gemini API for embeddings
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface DocumentEmbedding {
  id: number;
  chunk_text: string;
  embedding: number[];
  source_file: string;
  source_url: string | null;
  created_at: string;
}

/**
 * Generate embedding vector for a given text using gemini-embedding-001
 * @param text - The text to generate embeddings for
 * @returns The embedding vector as an array of numbers
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  console.log('[VectorSearch] Generating embedding for text:', text.substring(0, 100) + '...');
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('[VectorSearch] GEMINI_API_KEY is not set!');
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    // Use REST API directly to control output dimensionality
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: {
            parts: [{ text }]
          },
          taskType: 'RETRIEVAL_QUERY',
          outputDimensionality: 768
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[VectorSearch] Gemini API error:', error);
      throw new Error(`Gemini API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const embedding = data.embedding.values;
    
    console.log('[VectorSearch] Successfully generated embedding, dimension:', embedding.length);
    
    if (embedding.length !== 768) {
      throw new Error(`Expected 768 dimensions but got ${embedding.length}`);
    }
    
    return embedding;
  } catch (error) {
    console.error("[VectorSearch] Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for relevant documents using vector similarity
 * @param queryEmbedding - The embedding vector of the search query
 * @param limit - Maximum number of results to return (default: 5)
 * @param similarityThreshold - Minimum similarity score (0-1, default: 0.5)
 * @returns Array of relevant document chunks with metadata
 */
export async function searchDocuments(
  queryEmbedding: number[],
  limit: number = 5,
  similarityThreshold: number = 0.5
): Promise<DocumentEmbedding[]> {
  console.log('[VectorSearch] Searching documents with params:', {
    embeddingDimension: queryEmbedding.length,
    limit,
    similarityThreshold
  });

  try {
    // Call the RPC function for vector similarity search
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: similarityThreshold,
      match_count: limit,
    });

    if (error) {
      console.error("[VectorSearch] Supabase RPC error:", error);
      throw new Error(`Failed to search documents: ${error.message}`);
    }

    console.log('[VectorSearch] Search results:', {
      documentsFound: data?.length || 0,
      documents: data?.map((d: any) => ({
        source: d.source_file,
        similarity: d.similarity,
        textPreview: d.chunk_text?.substring(0, 50) + '...'
      }))
    });

    return data || [];
  } catch (error) {
    console.error("[VectorSearch] Error in searchDocuments:", error);
    throw error;
  }
}

/**
 * Combined function: Generate embedding and search for relevant documents
 * @param query - The search query text
 * @param limit - Maximum number of results to return (default: 5)
 * @param similarityThreshold - Minimum similarity score (0-1, default: 0.5)
 * @returns Array of relevant document chunks with metadata
 */
export async function searchDocumentsByQuery(
  query: string,
  limit: number = 5,
  similarityThreshold: number = 0.5
): Promise<DocumentEmbedding[]> {
  console.log('[VectorSearch] Starting search for query:', query);
  
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Search for similar documents
    const results = await searchDocuments(queryEmbedding, limit, similarityThreshold);
    
    console.log('[VectorSearch] Search completed successfully, found', results.length, 'documents');
    return results;
  } catch (error) {
    console.error('[VectorSearch] searchDocumentsByQuery failed:', error);
    throw error;
  }
}

/**
 * Format search results into a context string for the LLM
 * @param documents - Array of document embeddings from search
 * @returns Formatted context string
 */
export function formatDocumentsAsContext(documents: DocumentEmbedding[]): string {
  if (documents.length === 0) {
    return "No relevant documents found.";
  }

  return documents
    .map((doc, index) => {
      const sourceInfo = doc.source_url
        ? `Source: ${doc.source_file} (${doc.source_url})`
        : `Source: ${doc.source_file}`;

      return `[Document ${index + 1}]
${sourceInfo}
${doc.chunk_text}
---`;
    })
    .join("\n\n");
}
