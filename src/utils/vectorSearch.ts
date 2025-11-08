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
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
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
  try {
    // Call the RPC function for vector similarity search
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: similarityThreshold,
      match_count: limit,
    });

    if (error) {
      console.error("Error searching documents:", error);
      throw new Error("Failed to search documents");
    }

    return data || [];
  } catch (error) {
    console.error("Error in searchDocuments:", error);
    throw new Error("Failed to search documents");
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
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Search for similar documents
  return searchDocuments(queryEmbedding, limit, similarityThreshold);
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
