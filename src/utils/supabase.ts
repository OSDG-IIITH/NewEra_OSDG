import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for the projects table
export interface Project {
  id: string;
  title: string;
  description: string;
  site_link: string;
  date_initiated: string;
  instruction_book: string | null;
  image_url: string | null;
  added_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectInsert {
  title: string;
  description: string;
  site_link: string;
  date_initiated: string;
  instruction_book?: string;
  image_url?: string;
  added_by: string;
}

// Types for the document_embeddings table
export interface DocumentEmbedding {
  id: number;
  chunk_text: string;
  embedding: number[];
  source_file: string;
  source_url: string | null;
  created_at: string;
}
