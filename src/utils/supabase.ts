import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables!', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

console.log('[Supabase] Initializing client with URL:', supabaseUrl.substring(0, 30) + '...');

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

// Types for IIIT Forms (imported from forms.ts for consistency)
export interface FormUser {
  id: string;
  email: string;
  name: string;
  handle?: string;
  created_at: string;
  updated_at: string;
}

export interface FormQuestion {
  id: string;
  type: 'text' | 'textarea' | 'email' | 'number' | 'radio' | 'checkbox' | 'dropdown' | 'date' | 'time' | 'file';
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  questions: FormQuestion[];
}

export interface FormStructure {
  sections: FormSection[];
  settings?: {
    theme?: string;
    logo?: string;
  };
}

export interface IIITForm {
  id: string;
  owner: string;
  slug: string;
  title: string;
  description?: string;
  structure: FormStructure;
  created_at: string;
  modified: string;
  live: boolean;
  opens?: string;
  closes?: string;
  anonymous: boolean;
  max_responses?: number;
  individual_limit: number;
  editable_responses: boolean;
  share_url: string;
  manage_url: string;
}
