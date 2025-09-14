// Enhanced KV utilities specifically for server usage
import * as kv from './kv_store.tsx';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Enhanced getByPrefix that returns both key and value
export const getByPrefixWithKeys = async (prefix: string): Promise<Array<{key: string, value: any}>> => {
  const { data, error } = await supabase.from("kv_store_8e756be3").select("key, value").like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

// Re-export all standard kv functions
export * from './kv_store.tsx';