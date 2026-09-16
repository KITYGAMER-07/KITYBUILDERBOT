import { createClient } from '@supabase/supabase-js';

let storageClient;

const getStorageClient = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Supabase Storage is not configured yet. Add the VITE_SUPABASE variables and redeploy.');
  }
  if (!storageClient) {
    storageClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return storageClient;
};

export const uploadToSupabaseSignedUrl = async ({ bucket, path, token, file }) => {
  const { error } = await getStorageClient()
    .storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file, {
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream'
    });

  if (error) throw new Error(error.message || 'Supabase upload failed.');
};
